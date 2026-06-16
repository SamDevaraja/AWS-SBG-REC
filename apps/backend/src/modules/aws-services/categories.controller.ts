import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('AWS Globe Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all geographic categories' })
  async getAll(@Query('includeInactive') includeInactive?: string) {
    const data = await this.categoriesService.getAll({
      includeInactive: includeInactive === 'true',
    });
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.categoriesService.getById(id);
    return data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create geographic category' })
  async create(@Body() body: any) {
    const data = await this.categoriesService.create(body);
    return data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update geographic category' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.categoriesService.update(id, body);
    return data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete geographic category' })
  async delete(@Param('id') id: string) {
    await this.categoriesService.delete(id);
    return {
      message: `Category with ID ${id} archived successfully`,
    };
  }
}
