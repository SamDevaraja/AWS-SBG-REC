import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CrewService } from './crew.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Crew')
@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get operational stats and activities for the crew dashboard' })
  getDashboard() {
    return this.crewService.getDashboard();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get list of events assigned to operational crew' })
  getEvents() {
    return this.crewService.getEvents();
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get searchable log of attendances' })
  getAttendance(@Query('search') search?: string) {
    return this.crewService.getAttendance({ search });
  }

  @Post('attendance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark attendance (check in) for a ticket code' })
  markAttendance(@Body() dto: MarkAttendanceDto) {
    return this.crewService.markAttendance(dto);
  }

  @Get('tickets/verify')
  @ApiOperation({ summary: 'Verify ticket code validity' })
  verifyTicket(@Query('ticketCode') ticketCode: string) {
    return this.crewService.verifyTicket(ticketCode);
  }

  @Get('registrations/search')
  @ApiOperation({ summary: 'Search registrations by name, email, roll number, or code' })
  searchRegistrations(@Query('query') query: string) {
    return this.crewService.searchRegistrations(query);
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Retrieve operational read-only announcements' })
  getAnnouncements() {
    return this.crewService.getAnnouncements();
  }

  @Post('incidents')
  @ApiOperation({ summary: 'Create incident report' })
  createIncident(@Body() dto: CreateIncidentDto) {
    return this.crewService.createIncident(dto);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get list of reported incidents' })
  getIncidents() {
    return this.crewService.getIncidents();
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get list of operational crew tasks' })
  getTasks() {
    return this.crewService.getTasks();
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update status of an operational task' })
  updateTaskStatus(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.crewService.updateTaskStatus(id, dto);
  }
}
