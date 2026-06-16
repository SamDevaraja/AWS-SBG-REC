import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AwsServicesService } from './aws-services.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('AWS Services')
@Controller('services')
export class AwsServicesController {
  constructor(private readonly awsServicesService: AwsServicesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all AWS service categories' })
  async getCategories() {
    const data = await this.awsServicesService.getCategories();
    return data;
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all AWS services as JSON or CSV' })
  async exportData(
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response,
  ) {
    const fmt = format === 'csv' ? 'csv' : 'json';
    const exportedString = await this.awsServicesService.exportData(fmt);

    if (fmt === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=aws-services-export.csv',
      );
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=aws-services-export.json',
      );
    }
    return res.status(200).send(exportedString);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import AWS services from JSON or CSV' })
  async bulkImport(@Body() body: { fileContent: string; format: 'json' | 'csv' }) {
    const { fileContent, format } = body;
    if (!fileContent || !format) {
      throw new BadRequestException('fileContent and format are required');
    }
    const result = await this.awsServicesService.bulkImport(fileContent, format);
    return result;
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload AWS service icon image' })
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: diskStorage({
        destination: './uploads/services',
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only SVG, PNG, JPG, and WEBP image files are allowed.'), false);
        }
      },
    }),
  )
  uploadIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { url: `/uploads/services/${file.filename}` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all AWS services with optional filters' })
  async getAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
  ) {
    const data = await this.awsServicesService.getAll({
      search,
      categoryId,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      status,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single AWS service by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.awsServicesService.getById(id);
    return data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new AWS service (Core only)' })
  async create(@Body() body: any) {
    const data = await this.awsServicesService.create(body);
    return data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing AWS service (Core only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.awsServicesService.update(id, body);
    return data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an AWS service (Core only)' })
  async delete(@Param('id') id: string) {
    await this.awsServicesService.delete(id);
    return {
      message: `AWS Service with ID ${id} archived successfully`,
    };
  }
}
