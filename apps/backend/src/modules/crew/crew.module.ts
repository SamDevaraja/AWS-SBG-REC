import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma.module';
import { CrewController } from './crew.controller';
import { CrewService } from './crew.service';

@Module({
  imports: [PrismaModule],
  controllers: [CrewController],
  providers: [CrewService],
  exports: [CrewService],
})
export class CrewModule {}
