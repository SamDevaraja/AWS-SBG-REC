import { Module } from '@nestjs/common';
import { RoadmapModulesService } from './modules.service';
import { RoadmapModulesController } from './modules.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { RoadmapProgressModule } from '@/modules/progress/progress.module';

@Module({
  imports: [PrismaModule, AuthModule, RoadmapProgressModule],
  controllers: [RoadmapModulesController],
  providers: [RoadmapModulesService],
  exports: [RoadmapModulesService],
})
export class RoadmapModulesModule {}
