import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificationsService } from './certifications.service';

@ApiTags('Certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all certifications' })
  findAll(
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.certificationsService.findAll(level, search);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a certification by key' })
  findOne(@Param('key') key: string) {
    return this.certificationsService.findOne(key);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a certification' })
  create(@Body() data: any) {
    return this.certificationsService.create(data);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a certification by key' })
  remove(@Param('key') key: string) {
    return this.certificationsService.remove(key);
  }
}
