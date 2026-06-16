import { Module } from '@nestjs/common';
import { RoadmapTopicsService } from './topics.service';
import { RoadmapTopicsController } from './topics.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RoadmapProgressModule } from '@/modules/progress/progress.module';

@Module({
  imports: [PrismaModule, AuthModule, RoadmapProgressModule],
  controllers: [RoadmapTopicsController],
  providers: [RoadmapTopicsService],
  exports: [RoadmapTopicsService],
})
export class RoadmapTopicsModule {}
