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
import { RegionsService } from './regions.service';

@ApiTags('AWS Globe Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all AWS regions' })
  async getAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.regionsService.getAll({
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.regionsService.getById(id);
    return data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create AWS region' })
  async create(@Body() body: any) {
    const data = await this.regionsService.create(body);
    return data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update AWS region' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.regionsService.update(id, body);
    return data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete AWS region' })
  async delete(@Param('id') id: string) {
    await this.regionsService.delete(id);
    return {
      message: `Region with ID ${id} archived successfully`,
    };
  }
}
