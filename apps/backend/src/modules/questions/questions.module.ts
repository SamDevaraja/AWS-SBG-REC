import { Module } from '@nestjs/common';
import { RoadmapQuestionsService } from './questions.service';
import { RoadmapQuestionsController } from './questions.controller';
import { PrismaModule } from '@/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoadmapQuestionsController],
  providers: [RoadmapQuestionsService],
})
export class RoadmapQuestionsModule {}
