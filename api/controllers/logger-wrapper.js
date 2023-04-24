const winston = require('winston');
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error', options: { flags: 'w' } }),
    new winston.transports.File({ filename: 'combined.log', options: { flags: 'w' } }),
  ],
});
logger.info("Logger initialized");

exports.log = function(level, user, message) {
    if (level === "info") {
        logger.info("[" + user + "] " + message);
    }
    if (level === "error") {
        logger.error("[" + user + "] " + message);
    }
};