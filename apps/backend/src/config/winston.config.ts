import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const createWinstonConfig = (): WinstonModuleOptions => {
  const logDir = process.env.LOG_DIR || 'logs';
  const nodeEnv = process.env.NODE_ENV || 'development';

  const transports: winston.transport[] = [
    new winston.transports.Console({
      level: nodeEnv === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, stack }) => {
          let log = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
          if (stack) {
            log += `\n${stack}`;
          }
          return log;
        }),
      ),
    }),
  ];

  if (nodeEnv === 'production') {
    const errorRotateTransport = new DailyRotateFile({
      filename: `${logDir}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    });

    const combinedRotateTransport = new DailyRotateFile({
      filename: `${logDir}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
    });

    transports.push(errorRotateTransport, combinedRotateTransport);
  }

  return {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6,
    },
    transports,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: 'event-registration-api' },
  };
};
