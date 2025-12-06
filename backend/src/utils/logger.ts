import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const sensitiveFields = [
  'password',
  'token',
  'secret',
  'apiKey',
  'apikey',
  'api_key',
  'creditCard',
  'creditcard',
  'credit_card',
  'ssn',
  'authorization',
  'auth',
  'privateKey',
  'private_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'sessionId',
  'session_id'
];

// Custom format to redact sensitive data
const redactSensitiveData = winston.format((info) => {
  const redacted = JSON.parse(JSON.stringify(info));
  
  const redactObject = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Check if key contains sensitive field names
      const isSensitive = sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );
      
      if (isSensitive) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactObject(obj[key]);
      }
    });
  };
  
  redactObject(redacted);
  return redacted;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    redactSensitiveData(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
      })
    ),
  }));
}

// Replace console.log with secure logger
export const secureLog = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, error?: any) => {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    logger.error(message, { error: errorData });
  },
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};
