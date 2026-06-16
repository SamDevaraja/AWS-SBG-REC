import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoadmapTopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ReorderTopicsDto } from './dto/reorder-topics.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('roadmap/topics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CORE')
export class RoadmapTopicsController {
  constructor(private readonly topicsService: RoadmapTopicsService) {}

  @Get()
  async findAll() {
    return this.topicsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Post('reorder')
  async reorder(@Body() dto: ReorderTopicsDto) {
    return this.topicsService.reorder(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }
}
