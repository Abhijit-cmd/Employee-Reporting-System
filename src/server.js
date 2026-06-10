require("dotenv").config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];

const missingVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
  process.exit(1);
}
const path = require("path");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Trust the Nginx proxy for secure IP redirect
app.set("trust proxy", 1);

app.use(cookieParser());

app.use(helmet());

// Support comma-separated origins in FRONTEND_URL
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in development for easier testing
      if (process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  })
);
// ORIGIN VALIDATION MIDDLEWARE (DISABLED IN DEV)
// app.use((req, res, next) => {
//   const origin = req.get("origin");

//   // Allow requests without origin (Postman, curl, mobile apps)
//   if (!origin) {
//     return next();
//   }

//   if (!allowedOrigins.includes(origin)) {
//     return res.status(403).json({
//       message: "Invalid origin",
//     });
//   }

//   next();
// });

app.use(express.json({ limit: "10kb" }));

// Health check for the ALB target group
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ROUTES
const routes = require("./routes");
app.use("/api", routes);

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("/*splat", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  // Mask internal error details in production; 4xx messages are deliberate and safe to surface
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
const prisma = require("./prisma/prismaClient");

async function ensureReferenceData() {
  try {
    await prisma.reportStatus.createMany({
      data: [
        { statusName: "Pending" },
        { statusName: "Submitted" },
        { statusName: "Reviewed" },
      ],
      skipDuplicates: true,
    });
    await prisma.role.createMany({
      data: [{ roleName: "Admin" }, { roleName: "Employee" }],
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("Warning: could not seed reference data:", e.message);
  }
}

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await ensureReferenceData();
});

server.requestTimeout = 30000;
server.headersTimeout = 35000;
server.keepAliveTimeout = 5000;

// Graceful shutdown — let in-flight requests finish and close DB connections cleanly
function gracefulShutdown(signal) {
  console.log(`${signal} received: shutting down gracefully`);

  server.close(async (err) => {
    if (err) {
      console.error("Error while closing server:", err);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      console.log("Database connections closed. Exiting.");
      process.exit(0);
    } catch (e) {
      console.error("Error during shutdown:", e);
      process.exit(1);
    }
  });

  // Safety net: force-exit if shutdown hangs (e.g. a stuck request)
  setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
