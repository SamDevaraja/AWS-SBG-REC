import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface GetServicesFilters {
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  status?: string;
  isActive?: boolean;
}

@Injectable()
export class AwsServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(filters: GetServicesFilters = {}) {
    const where: Prisma.AWSServiceWhereInput = {
      isDeleted: false,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { serviceCode: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } },
        { category: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.aWSService.findMany({
      where,
      select: {
        id: true,
        serviceCode: true,
        name: true,
        slug: true,
        categoryId: true,
        iconUrl: true,
        shortDescription: true,
        isFeatured: true,
        isVisibleToEnthusiasts: true,
        status: true,
        displayOrder: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(id: string) {
    const service = await this.prisma.aWSService.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`AWS Service with ID ${id} not found`);
    }
    return service;
  }

  async create(data: any) {
    const conflict = await this.prisma.aWSService.findFirst({
      where: {
        OR: [
          { serviceCode: data.serviceCode },
          { name: data.name },
          { slug: data.slug },
        ],
        isDeleted: false,
      },
    });
    if (conflict) {
      throw new ConflictException(
        'A service with the same serviceCode, name, or slug already exists.',
      );
    }
    return this.prisma.aWSService.create({
      data: {
        ...data,
        relatedServices: data.relatedServices || [],
      },
    });
  }

  async update(id: string, data: any) {
    const service = await this.prisma.aWSService.findFirst({
      where: { id, isDeleted: false },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const conflict = await this.prisma.aWSService.findFirst({
      where: {
        id: { not: id },
        OR: [
          { serviceCode: data.serviceCode },
          { name: data.name },
          { slug: data.slug },
        ],
        isDeleted: false,
      },
    });
    if (conflict) {
      throw new ConflictException(
        'A service with the same serviceCode, name, or slug already exists.',
      );
    }

    return this.prisma.aWSService.update({
      where: { id },
      data: {
        ...data,
        relatedServices: data.relatedServices || [],
      },
    });
  }

  async delete(id: string) {
    const service = await this.prisma.aWSService.findFirst({
      where: { id, isDeleted: false },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return this.prisma.aWSService.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async getCategories() {
    return this.prisma.aWSServiceCategory.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async exportData(format: 'json' | 'csv'): Promise<string> {
    const services = await this.prisma.aWSService.findMany({
      where: { isDeleted: false },
      include: {
        category: { select: { slug: true, name: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    if (format === 'json') {
      return JSON.stringify(services, null, 2);
    }

    const headers = [
      'serviceCode', 'name', 'slug', 'categorySlug', 'shortDescription',
      'fullDescription', 'characteristics', 'features', 'useCases',
      'pricingModels', 'relatedServices', 'iconUrl', 'keywords',
      'awsDocumentationUrl', 'isFeatured', 'status', 'comparisonTags',
      'displayOrder', 'isActive',
    ];

    const escapeCsv = (str: any): string => {
      if (str === null || str === undefined) return '';
      let val = '';
      if (Array.isArray(str)) {
        val = str.join(';');
      } else if (typeof str === 'object') {
        val = JSON.stringify(str);
      } else {
        val = String(str);
      }
      return `"${val.replace(/"/g, '""')}"`;
    };

    const rows = [headers.join(',')];
    for (const s of services) {
      rows.push([
        escapeCsv(s.serviceCode), escapeCsv(s.name), escapeCsv(s.slug),
        escapeCsv((s as any).category?.slug || ''), escapeCsv(s.shortDescription),
        escapeCsv(s.fullDescription), escapeCsv(s.characteristics),
        escapeCsv(s.features), escapeCsv(s.useCases), escapeCsv(s.pricingModels),
        escapeCsv(s.relatedServices), escapeCsv(s.iconUrl), escapeCsv(s.keywords),
        escapeCsv(s.awsDocumentationUrl), escapeCsv(s.isFeatured),
        escapeCsv(s.status), escapeCsv(s.comparisonTags),
        escapeCsv(s.displayOrder), escapeCsv(s.isActive),
      ].join(','));
    }
    return rows.join('\n');
  }

  async bulkImport(fileContent: string, format: 'json' | 'csv'): Promise<{ count: number }> {
    let rawServices: any[] = [];

    if (format === 'json') {
      rawServices = JSON.parse(fileContent);
      if (!Array.isArray(rawServices)) {
        throw new Error('JSON root must be an array of service objects.');
      }
    } else {
      rawServices = this.parseCSVtoServices(fileContent);
    }

    const categories = await this.prisma.aWSServiceCategory.findMany({
      where: { isDeleted: false },
    });
    const categoriesMap = new Map(categories.map((c) => [c.slug, c.id]));
    const defaultCategoryId = categories[0]?.id || '';

    let importedCount = 0;

    for (const service of rawServices) {
      if (!service.serviceCode || !service.name || !service.slug) continue;

      let categoryId = service.categoryId;
      if (!categoryId && service.categorySlug) {
        categoryId = categoriesMap.get(service.categorySlug);
      }
      if (!categoryId) categoryId = defaultCategoryId;

      const dbData: any = {
        name: service.name,
        slug: service.slug,
        categoryId,
        shortDescription: service.shortDescription || 'No short description provided.',
        fullDescription: service.fullDescription || 'No full description provided.',
        characteristics: service.characteristics || [],
        features: service.features || [],
        useCases: service.useCases || [],
        pricingModels: service.pricingModels || [],
        relatedServices: service.relatedServices || [],
        iconUrl: service.iconUrl || `https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services/${service.slug}.svg`,
        keywords: service.keywords || [],
        awsDocumentationUrl: service.awsDocumentationUrl || '',
        isFeatured: service.isFeatured ?? false,
        status: service.status || 'GA',
        comparisonTags: service.comparisonTags || [],
        displayOrder: service.displayOrder ?? 0,
        isActive: service.isActive ?? true,
        isDeleted: false,
      };

      await this.prisma.aWSService.upsert({
        where: { serviceCode: service.serviceCode },
        update: dbData,
        create: { serviceCode: service.serviceCode, ...dbData },
      });

      importedCount++;
    }

    return { count: importedCount };
  }

  private parseCSVtoServices(text: string): any[] {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let entry = '';

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') { entry += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (c === ',' && !inQuotes) {
        row.push(entry); entry = '';
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        row.push(entry); result.push(row); row = []; entry = '';
      } else {
        entry += c;
      }
    }
    if (row.length > 0 || entry !== '') { row.push(entry); result.push(row); }

    const filtered = result.filter((r) => r.length > 0 && r.some((cell) => cell.trim() !== ''));
    if (filtered.length < 2) return [];

    const headers = filtered[0].map((h) => h.trim());
    const services: any[] = [];
    const arrayFields = ['characteristics', 'features', 'useCases', 'pricingModels', 'keywords', 'comparisonTags'];

    for (let i = 1; i < filtered.length; i++) {
      const row = filtered[i];
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const val = row[j] ? row[j].trim() : '';
        if (!header) continue;
        if (arrayFields.includes(header)) {
          obj[header] = val ? val.split(';').map((x) => x.trim()).filter(Boolean) : [];
        } else if (header === 'relatedServices') {
          try { obj[header] = val ? JSON.parse(val) : []; }
          catch { obj[header] = val.split(';').map((x) => { const [name, slug] = x.split(':'); return { name: name || '', slug: slug || '' }; }).filter((x) => x.name); }
        } else if (header === 'isFeatured' || header === 'isActive') {
          obj[header] = val.toLowerCase() === 'true' || val === '1';
        } else if (header === 'displayOrder') {
          obj[header] = val ? Number(val) : 0;
        } else {
          obj[header] = val;
        }
      }
      if (obj.serviceCode) services.push(obj);
    }
    return services;
  }
}
