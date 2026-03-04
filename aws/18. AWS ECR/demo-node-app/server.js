const express = require("express");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + "s",
  });
});

app.get("/api/info", (req, res) => {
  res.json({
    app: "Demo Express App",
    version: "1.0.0",
    node: process.version,
    platform: os.platform(),
    hostname: os.hostname(),
    memory: {
      total: (os.totalmem() / 1024 / 1024).toFixed(0) + " MB",
      free: (os.freemem() / 1024 / 1024).toFixed(0) + " MB",
    },
    env: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

app.get("/api/routes", (req, res) => {
  res.json({
    routes: [
      { method: "GET", path: "/", description: "Home page" },
      { method: "GET", path: "/api/health", description: "Health check" },
      { method: "GET", path: "/api/info", description: "Server info" },
      { method: "GET", path: "/api/routes", description: "List all routes" },
      { method: "POST", path: "/api/echo", description: "Echo request body" },
    ],
  });
});

app.post("/api/echo", (req, res) => {
  res.json({ echo: req.body, received_at: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});
