import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  findAll(@Query() pagination: PaginationDto) {
    return this.eventsService.findAll(pagination);
  }

  @Get('organizer/:organizerId')
  @ApiOperation({ summary: 'Get events by organizer' })
  findByOrganizer(
    @Param('organizerId', ParseUUIDPipe) organizerId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.eventsService.findByOrganizer(organizerId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive an event' })
  archive(@Param('id') id: string) {
    return this.eventsService.archive(id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an event' })
  publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Patch(':id/close-registration')
  @ApiOperation({ summary: 'Close event registration' })
  closeRegistration(@Param('id') id: string) {
    return this.eventsService.closeRegistration(id);
  }

  @Patch(':id/reopen-registration')
  @ApiOperation({ summary: 'Reopen event registration' })
  reopenRegistration(@Param('id') id: string) {
    return this.eventsService.reopenRegistration(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an event' })
  @HttpCode(HttpStatus.CREATED)
  duplicate(@Param('id') id: string) {
    return this.eventsService.duplicate(id);
  }

  @Post(':id/poster')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload event poster' })
  @HttpCode(HttpStatus.OK)
  uploadPoster(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.eventsService.uploadPoster(id, file);
  }

  @Post(':id/agenda')
  @ApiOperation({ summary: 'Add agenda item to event' })
  @HttpCode(HttpStatus.CREATED)
  addAgenda(@Param('id') eventId: string, @Body() dto: CreateAgendaDto) {
    return this.eventsService.addAgenda(eventId, dto);
  }

  @Patch('agenda/:agendaId')
  @ApiOperation({ summary: 'Update agenda item' })
  updateAgenda(@Param('agendaId', ParseUUIDPipe) agendaId: string, @Body() dto: CreateAgendaDto) {
    return this.eventsService.updateAgenda(agendaId, dto);
  }

  @Delete('agenda/:agendaId')
  @ApiOperation({ summary: 'Remove agenda item' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAgenda(@Param('agendaId', ParseUUIDPipe) agendaId: string) {
    return this.eventsService.removeAgenda(agendaId);
  }

  @Post(':id/speakers')
  @ApiOperation({ summary: 'Add speaker to event' })
  @HttpCode(HttpStatus.CREATED)
  addSpeaker(@Param('id') eventId: string, @Body() dto: CreateSpeakerDto) {
    return this.eventsService.addSpeaker(eventId, dto);
  }

  @Patch('speakers/:speakerId')
  @ApiOperation({ summary: 'Update speaker' })
  updateSpeaker(
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
    @Body() dto: CreateSpeakerDto,
  ) {
    return this.eventsService.updateSpeaker(speakerId, dto);
  }

  @Delete('speakers/:speakerId')
  @ApiOperation({ summary: 'Remove speaker' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSpeaker(@Param('speakerId', ParseUUIDPipe) speakerId: string) {
    return this.eventsService.removeSpeaker(speakerId);
  }

  @Put(':id/form-fields')
  @ApiOperation({ summary: 'Replace all form fields for an event' })
  updateFormFields(
    @Param('id') eventId: string,
    @Body() fields: UpdateFormFieldDto[],
  ) {
    return this.eventsService.updateFormFields(eventId, fields);
  }
}
