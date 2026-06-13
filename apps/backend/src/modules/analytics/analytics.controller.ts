import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GetPopularEventsDto } from './dto/popular-events.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Get statistics for a specific event' })
  @ApiResponse({ status: 200, description: 'Event stats retrieved successfully' })
  async getEventStats(@Param('eventId') eventId: string) {
    return this.analyticsService.getEventStats(eventId);
  }

  @Get('popular-events')
  @ApiOperation({ summary: 'Get popular events by registration count' })
  @ApiResponse({ status: 200, description: 'Popular events retrieved successfully' })
  async getPopularEvents(@Query() query: GetPopularEventsDto) {
    return this.analyticsService.getPopularEvents(query.limit);
  }


  @Get('registrations-over-time')
  @ApiOperation({ summary: 'Get daily registration counts for last 30 days' })
  @ApiResponse({ status: 200, description: 'Registrations over time retrieved successfully' })
  async getRegistrationsOverTime() {
    return this.analyticsService.getRegistrationsOverTime();
  }

  @Get('attendance-over-time')
  @ApiOperation({ summary: 'Get daily attendance counts for last 30 days' })
  @ApiResponse({ status: 200, description: 'Attendance over time retrieved successfully' })
  async getAttendanceOverTime() {
    return this.analyticsService.getAttendanceOverTime();
  }

  @Get('events-by-status')
  @ApiOperation({ summary: 'Get count of events grouped by status' })
  @ApiResponse({ status: 200, description: 'Events by status retrieved successfully' })
  async getEventsByStatus() {
    return this.analyticsService.getEventsByStatus();
  }

  @Get('registrations-by-event')
  @ApiOperation({ summary: 'Get registration counts grouped by event' })
  @ApiResponse({ status: 200, description: 'Registrations by event retrieved successfully' })
  async getRegistrationsByEvent() {
    return this.analyticsService.getRegistrationsByEvent();
  }
}
