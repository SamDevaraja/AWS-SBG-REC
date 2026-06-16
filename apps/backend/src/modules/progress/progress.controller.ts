import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RoadmapProgressService } from './progress.service';
import { QuizAttemptDto } from './dto/quiz-attempt.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('roadmap')
export class RoadmapProgressController {
  constructor(private readonly progressService: RoadmapProgressService) {}

  @Get('progress/me')
  async getMyProgress(@Request() req: any) {
    return this.progressService.getUserProgress(req.user.id);
  }

  @Get('modules/:moduleId/progress')
  async getModuleProgress(@Param('moduleId') moduleId: string, @Request() req: any) {
    return this.progressService.getModuleProgress(req.user.id, moduleId);
  }

  @Post('modules/:moduleId/quiz/attempt')
  async submitQuizAttempt(
    @Param('moduleId') moduleId: string,
    @Body() dto: QuizAttemptDto,
    @Request() req: any,
  ) {
    return this.progressService.submitQuizAttempt(req.user.id, moduleId, dto);
  }

  @Get('modules/:moduleId/quiz/review')
  async getQuizReview(@Param('moduleId') moduleId: string, @Request() req: any) {
    return this.progressService.getQuizReview(req.user.id, moduleId);
  }

  @Get('learners')
  @UseGuards(RolesGuard)
  @Roles('CORE', 'CREW')
  async getLearners() {
    return this.progressService.findAllLearners();
  }
}
