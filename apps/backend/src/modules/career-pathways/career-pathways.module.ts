import { Module } from '@nestjs/common';
import { CareerPathwaysController } from './career-pathways.controller';
import { CareerPathwaysService } from './career-pathways.service';

@Module({
  controllers: [CareerPathwaysController],
  providers: [CareerPathwaysService],
})
export class CareerPathwaysModule {}
