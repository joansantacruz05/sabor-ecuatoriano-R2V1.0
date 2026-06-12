const express = require("express");
const createCorsMiddleware = require("./middleware/cors");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const path = require("path");
const http = require("http");
const https = require("https");

const app = express();

app.disable("x-powered-by");
app.use(createCorsMiddleware());
app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API Sabor Ecuatoriano operativa" });
});

app.get("/api/proxy-image", (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).json({ error: "Missing url parameter" });
  const urlObj = new URL(imageUrl);
  const client = urlObj.protocol === "https:" ? https : http;
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
  };
  client.request(options, (proxyRes) => {
    const ct = proxyRes.headers["content-type"] || "";
    res.setHeader("Content-Type", ct.startsWith("image/") ? ct : "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    proxyRes.pipe(res);
  }).on("error", () => res.status(502).json({ error: "Failed to fetch image" })).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return notFoundHandler(req, res, next);
  }
  next();
});
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});
app.use(errorHandler);

module.exports = app;
