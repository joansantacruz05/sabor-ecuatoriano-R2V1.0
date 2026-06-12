const express = require("express");
const createCorsMiddleware = require("./middleware/cors");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const path = require("path");

const app = express();

app.disable("x-powered-by");
app.use(createCorsMiddleware());
app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API Sabor Ecuatoriano operativa" });
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
