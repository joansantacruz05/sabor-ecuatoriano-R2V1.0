require("dotenv").config();
const app = require("./app");
const logger = require("./logger");

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  logger.error("JWT_SECRET no está definido en .env");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  logger.error("DATABASE_URL no está definido en .env");
  process.exit(1);
}

app.listen(PORT, () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`);
  logger.info(`CORS permitido para: ${process.env.CORS_ORIGIN || "http://localhost:5500"}`);
});
