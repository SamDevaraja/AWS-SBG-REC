import { Module } from '@nestjs/common';
import { RoadmapLearningService } from './learning.service';
import { RoadmapLearningController } from './learning.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RoadmapProgressModule } from '@/modules/progress/progress.module';

@Module({
  imports: [PrismaModule, AuthModule, RoadmapProgressModule],
  controllers: [RoadmapLearningController],
  providers: [RoadmapLearningService],
})
export class RoadmapLearningModule {}
