import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { VerifyTicketDto } from './dto/verify-ticket.dto';
import { GetAttendanceDto } from './dto/attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify a ticket' })
  @HttpCode(HttpStatus.OK)
  verifyTicket(@Body() dto: VerifyTicketDto) {
    return this.attendanceService.verifyTicket(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance/tickets records' })
  findAll(@Query() query: GetAttendanceDto) {
    return this.attendanceService.findAll(query);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get attendance by event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  getAttendanceByEvent(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceByEvent(eventId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get attendance by user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  getAttendanceByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.attendanceService.getAttendanceByUser(userId);
  }

  @Get('stats/:eventId')
  @ApiOperation({ summary: 'Get attendance statistics for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  getAttendanceStats(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceStats(eventId);
  }
}
