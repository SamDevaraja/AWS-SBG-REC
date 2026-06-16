import { Module } from '@nestjs/common';
import { RoadmapSlidesService } from './slides.service';
import { RoadmapSlidesController } from './slides.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoadmapSlidesController],
  providers: [RoadmapSlidesService],
})
export class RoadmapSlidesModule {}
