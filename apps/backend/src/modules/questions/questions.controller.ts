import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { RoadmapQuestionsService } from './questions.service';
import { BulkSyncQuestionsDto } from './dto/bulk-sync-questions.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('roadmap/modules/:moduleId/questions')
export class RoadmapQuestionsController {
  constructor(private readonly questionsService: RoadmapQuestionsService) {}

  @Get()
  async findAll(@Param('moduleId') moduleId: string) {
    return this.questionsService.findAllByModule(moduleId);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async syncQuestions(
    @Param('moduleId') moduleId: string,
    @Body() dto: BulkSyncQuestionsDto,
  ) {
    return this.questionsService.syncQuestions(moduleId, dto);
  }
}
