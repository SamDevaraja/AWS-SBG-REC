import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new announcement' })
  create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all announcements for an event' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.announcementsService.findByEvent(eventId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.announcementsService.remove(id);
  }
}
