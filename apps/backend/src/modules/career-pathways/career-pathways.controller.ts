import { Controller, Get, Param } from '@nestjs/common';
import { CareerPathwaysService } from './career-pathways.service';
import { CareerPathwayListItem, CareerPathwayDetail } from './dto/career-pathway-response.dto';

@Controller('career-pathways')
export class CareerPathwaysController {
  constructor(private readonly careerPathwaysService: CareerPathwaysService) {}

  @Get()
  findAll(): Promise<CareerPathwayDetail[]> {
    return this.careerPathwaysService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<CareerPathwayDetail> {
    return this.careerPathwaysService.findBySlug(slug);
  }
}
