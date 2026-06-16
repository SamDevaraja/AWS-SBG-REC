import { Module } from '@nestjs/common';
import { RoadmapProgressService } from './progress.service';
import { RoadmapProgressController } from './progress.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoadmapProgressController],
  providers: [RoadmapProgressService],
  exports: [RoadmapProgressService],
})
export class RoadmapProgressModule {}
