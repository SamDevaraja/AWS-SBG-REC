import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { RoadmapSlidesService } from './slides.service';
import { BulkSyncSlidesDto } from './dto/bulk-sync-slides.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('roadmap/modules/:moduleId/slides')
export class RoadmapSlidesController {
  constructor(private readonly slidesService: RoadmapSlidesService) {}

  @Get()
  async findAll(@Param('moduleId') moduleId: string) {
    return this.slidesService.findAllByModule(moduleId);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async syncSlides(@Param('moduleId') moduleId: string, @Body() dto: BulkSyncSlidesDto) {
    return this.slidesService.syncSlides(moduleId, dto);
  }
}
