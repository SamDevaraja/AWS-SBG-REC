import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(): Promise<void> {
    process.on('beforeExit', async () => {
      await this.$disconnect();
    });
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const models = Reflect.ownKeys(this).filter(
      (key): key is string => typeof key === 'string' && !key.startsWith('_'),
    );

    return Promise.all(
      models.map((modelName) => (this as any)[modelName].deleteMany()),
    ).then(() => undefined);
  }
}
