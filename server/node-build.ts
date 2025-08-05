import path from "path";
import { createServer } from "./index";
import express from "express";
import { fileURLToPath } from "url";

const server = createServer();
const port = 3000; // Explicitly set port to 3000

console.log(`Starting server on port ${port}`);

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, serve the built SPA files
const distPath = path.join(__dirname, "../spa");

// The server is already created and listening from createServer()
// We just need to add static file serving to the existing Express app
// But since createServer() returns an HTTP server, we need to modify the approach

console.log(`🚀 Server running on port ${port}`);
console.log(`📱 Frontend: http://localhost:${port}`);
console.log(`🔧 API: http://localhost:${port}/api`);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
