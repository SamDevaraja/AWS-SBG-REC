import { Controller, Get, Param, UseGuards, Request, Req } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RoadmapLearningService } from './learning.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('roadmap/learning')
export class RoadmapLearningController {
  constructor(private readonly learningService: RoadmapLearningService) {}

  @Get('topics')
  async findTopics(@Request() req: any) {
    return this.learningService.findTopics(req.user.id);
  }

  @Get('continue')
  async findContinue(@Request() req: any) {
    return this.learningService.findContinueModule(req.user.id);
  }

  @Get('topics/:slug')
  async findTopicBySlug(@Param('slug') slug: string, @Request() req: any) {
    return this.learningService.findTopicBySlug(slug, req.user.id);
  }
}
