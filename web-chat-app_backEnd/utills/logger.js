const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const nodemailer = require('nodemailer');

// Transport for critical alerts via email
const alertEmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendCriticalAlert = async (message) => {
  try {
    await alertEmailTransporter.sendMail({
      from: `"Security Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL_RECIPIENT,
      subject: 'Critical Security Alert',
      text: message,
    });
  } catch (error) {
    console.error('Failed to send alert email:', error);
  }
};

// Mask sensitive data
const maskSensitiveData = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = info.message.replace(/password=[^&\s]+/g, 'password=*****');
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    maskSensitiveData(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d',
    }),
    new winston.transports.Console(),
  ],
});

// Add critical alert handler
logger.on('data', (log) => {
  if (log.level === 'error' && process.env.ALERT_EMAIL_RECIPIENT) {
    sendCriticalAlert(`Critical log event: ${log.message}`);
  }
});

module.exports = logger;
