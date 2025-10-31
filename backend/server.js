const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const skillRoutes = require("./routes/skills");
const matchRoutes = require("./routes/matches");
const messageRoutes = require("./routes/messages");
const sessionRoutes = require("./routes/sessions");
const adminRoutes = require("./routes/admin");

const { setupSocketHandlers } = require("./socket/handlers");
const { verifyToken } = require("./middleware/auth");
const { connectFirebase } = require("./config/firebase");

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set("io", io);

// Connect to Firebase
connectFirebase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/matches", verifyToken, matchRoutes);
app.use("/api/messages", verifyToken, messageRoutes);
app.use("/api/sessions", verifyToken, sessionRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "SkillSwap Backend API",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    error: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SkillSwap Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

module.exports = { app, server, io };
