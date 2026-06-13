import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './config/winston.config';
import compression from 'compression';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as net from 'net';

function isRedisReachable(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

function loadEnvOverride() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (e) {
    console.error('Error loading override env:', e);
  }
}

async function bootstrap() {
  loadEnvOverride();
  
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisReachable = await isRedisReachable(redisHost, redisPort, 1000);
  process.env.PROCESS_REDIS_OFFLINE = redisReachable ? 'false' : 'true';

  const winstonLogger = WinstonModule.createLogger(createWinstonConfig());

  if (!redisReachable) {
    winstonLogger.warn('Redis is offline. Running NestJS core app in standalone direct ingestion mode.');
  }

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // Gzip compress all responses — reduces JSON payload size by ~70-80%
  app.use(compression());

  // Serve uploads directory statically (shared root uploads folder)
  app.use('/uploads', express.static(path.join(process.cwd(), '..', '..', 'uploads')));


  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',')
    : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Event Registration Core API')
    .setDescription('Enterprise-grade Event Registration Core Platform API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const uploadsDir = path.join(process.cwd(), '..', '..', 'uploads', 'events');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const port = parseInt(process.env.APP_PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');

  winstonLogger.log('info', `Application is running on: http://localhost:${port}`);
  winstonLogger.log('info', `Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
