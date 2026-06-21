import { Controller, Get, Param } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CertificationListItem, CertificationDetail } from './dto/certification-response.dto';

@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  findAll(): Promise<CertificationListItem[]> {
    return this.certificationsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<CertificationDetail> {
    return this.certificationsService.findBySlug(slug);
  }
}
