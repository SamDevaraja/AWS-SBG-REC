import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma.module';
import { CrewController } from './crew.controller';
import { CrewService } from './crew.service';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [PrismaModule, AttendanceModule],
  controllers: [CrewController],
  providers: [CrewService],
  exports: [CrewService],
})
export class CrewModule {}

