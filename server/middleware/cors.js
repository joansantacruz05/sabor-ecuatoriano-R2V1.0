const cors = require("cors");

function createCorsMiddleware() {
  const origin = process.env.CORS_ORIGIN || "http://localhost:5500";

  return cors({
    origin: function (requestOrigin, callback) {
      if (!requestOrigin || requestOrigin === origin) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
}

module.exports = createCorsMiddleware;
