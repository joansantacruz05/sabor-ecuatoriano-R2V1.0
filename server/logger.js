const levels = { info: "INFO", warn: "WARN", error: "ERROR" };

function log(level, message, meta) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${levels[level] || "LOG"}]`;
  if (meta !== undefined) {
    console[level === "error" ? "error" : "log"](prefix, message, meta);
  } else {
    console[level === "error" ? "error" : "log"](prefix, message);
  }
}

module.exports = {
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta)
};
