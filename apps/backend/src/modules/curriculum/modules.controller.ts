import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { RoadmapModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderModulesDto } from './dto/reorder-modules.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('roadmap/modules')
export class RoadmapModulesController {
  constructor(private readonly modulesService: RoadmapModulesService) {}

  @Get()
  async findAll(@Query('topicId') topicId?: string) {
    if (topicId) return this.modulesService.findByTopicId(topicId);
    return this.modulesService.findAll();
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return this.modulesService.findOneBySlug(slug);
  }

  @Get('tier/:tier')
  async findByTier(@Param('tier') tier: string) {
    return this.modulesService.findByTier(tier);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async reorder(@Body() dto: ReorderModulesDto) {
    return this.modulesService.reorder(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CORE')
  async remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
