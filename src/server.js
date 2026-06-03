require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(express.json({ limit: "10kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("Backend Connected Successfully");
});

const authRoutes   = require("./routes/auth.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes  = require("./routes/admin.routes");

app.use("/api/auth",    authLimiter, authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin",   adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: "Internal server error" });
});

// Unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
