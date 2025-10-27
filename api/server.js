const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const trainingRoutes = require("./routes/training");
const growRoutes = require("./routes/grow");
const storageRoutes = require("./routes/storage");
const websiteRoutes = require("./routes/websites");
const shopRoutes = require("./routes/shops");
const shopProductRoutes = require("./routes/shop-products");
const qrCodeRoutes = require("./routes/qrcode");
const finsangMartRoutes = require("./routes/finsangmart");
const bannerRoutes = require("./routes/banners");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://172.16.0.2:8081",
  "http://172.19.185.69:8081",
  "http://localhost:3001",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://172.24.132.187:3000",
  "http://172.24.132.187:8081",
  "http://172.24.132.187:19006",
  "http://10.254.86.30:3000",
  "http://10.254.86.30:8081",
  "http://10.254.86.30:19006",
  "http://10.254.86.30:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/grow", growRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/websites", websiteRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/shop-products", shopProductRoutes);
app.use("/api/qrcode", qrCodeRoutes);
app.use("/api/finsangmart", finsangMartRoutes);
app.use("/api/banners", bannerRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Handle CORS errors
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy violation",
      message: "Origin not allowed",
    });
  }

  // Handle multer errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "File too large",
      message: "File size exceeds the limit",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected file field",
      message: "Invalid file upload request",
    });
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinsangMart Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting enabled`);
  console.log(`📝 Logging: Morgan enabled`);
  console.log(`🗜️  Compression: Enabled`);
});

module.exports = app;
