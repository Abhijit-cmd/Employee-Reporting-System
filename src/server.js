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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

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

// Rate limiter for auth routes only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (_req, res) => {
  res.send("Backend Connected Successfully");
});

// ROUTES
const authRoutes = require("./routes/auth.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
 console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.requestTimeout = 30000;
server.headersTimeout = 35000;
server.keepAliveTimeout = 5000;