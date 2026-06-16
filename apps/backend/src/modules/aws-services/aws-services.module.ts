import { Module } from '@nestjs/common';
import { AwsServicesService } from './aws-services.service';
import { AwsServicesController } from './aws-services.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { UploadController } from './upload.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AwsServicesController, CategoriesController, RegionsController, UploadController],
  providers: [AwsServicesService, CategoriesService, RegionsService],
  exports: [AwsServicesService, CategoriesService, RegionsService],
})
export class AwsServicesModule {}

