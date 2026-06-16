import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EventsController } from './src/modules/events/events.controller';

async function bootstrap() {
  try {
    console.log('Bootstrapping NestJS application context...');
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
    const controller = app.get(EventsController);
    console.log('Invoking controller.findAll...');
    const result = await controller.findAll({});
    console.log('RESULT:', result);
    await app.close();
  } catch (err) {
    console.error('NEST ERROR LOGGED:', err);
  }
}

bootstrap();
