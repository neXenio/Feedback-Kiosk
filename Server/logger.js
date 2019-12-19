const winston = require('winston');

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 1024 * 1024 * 10,
      maxFiles: 10,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'info.log',
      level: 'info',
      maxsize: 1024 * 1024 * 10,
      maxFiles: 10,
      tailable: true
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.splat(),
      winston.format.simple()
    )
  }));
}

module.exports = logger