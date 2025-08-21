// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const database = require("./config/database");

// Routes
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const userRoutes = require("./routes/users");

const app = express();

/**
 * If you run HTTPS at Nginx and HTTP between Nginx -> Node,
 * this lets Express read X-Forwarded-* and req.secure correctly.
 */
app.set("trust proxy", 1);

/* -------------------- CORS (put this BEFORE helmet) -------------------- */
// In production, read comma-separated origins from CORS_ORIGINS
// e.g. CORS_ORIGINS=https://frontend-recipes-pearl.vercel.app,https://admin.growtower.lk
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
      ];

// Dynamic origin check so curl/Postman (no Origin) still work
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser clients
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
// Respond to preflight quickly
app.options("*", cors(corsOptions));
/* ---------------------------------------------------------------------- */

// Security headers (after CORS)
app.use(helmet());

// (Optional) Basic rate limiting (enable if you want)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect DB
database.connect();

/* ---------------------------- App routes ------------------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);

// Health
app.get("/health", (req, res) => {
  const dbStatus = database.isConnected();
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus ? "Connected" : "Disconnected",
      readyState: require("mongoose").connection.readyState,
    },
  });
});

// 404
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
