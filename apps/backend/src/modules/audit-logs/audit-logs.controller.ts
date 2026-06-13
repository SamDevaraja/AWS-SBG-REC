import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs (paginated)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.auditLogsService.findAll(pagination);
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiResponse({ status: 200, description: 'Entity audit logs retrieved successfully' })
  async findByEntity(
    @Param('entity') entity: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user' })
  @ApiResponse({ status: 200, description: 'User audit logs retrieved successfully' })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.auditLogsService.findByUser(userId, pagination);
  }

  @Get('action/:action')
  @ApiOperation({ summary: 'Get audit logs by action type' })
  @ApiResponse({ status: 200, description: 'Action audit logs retrieved successfully' })
  async findByAction(@Param('action') action: string, @Query() pagination: PaginationDto) {
    return this.auditLogsService.findByAction(action, pagination);
  }
}
