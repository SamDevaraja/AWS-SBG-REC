import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { GetRegistrationsDto } from './dto/registrations.dto';

@ApiTags('Registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register for an event' })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateRegistrationDto) {
    return this.registrationsService.register(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registrations' })
  findAll(@Query() query: GetRegistrationsDto) {
    return this.registrationsService.findAll(query);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get registrations for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  findByEvent(
    @Param('eventId') eventId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.registrationsService.findByEvent(eventId, pagination);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get registrations for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string, @Query() pagination: PaginationDto) {
    return this.registrationsService.findByUser(userId, pagination);
  }

  @Get('count/:eventId')
  @ApiOperation({ summary: 'Get registration count for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  getRegistrationCount(@Param('eventId') eventId: string) {
    return this.registrationsService.getRegistrationCount(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get registration by ID' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a registration' })
  @ApiParam({ name: 'id', description: 'Registration ID' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationsService.cancel(id);
  }
}
