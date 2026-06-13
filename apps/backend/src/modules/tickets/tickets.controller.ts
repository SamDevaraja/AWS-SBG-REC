import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetTicketsDto } from './dto/tickets.dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('code/:code')
  @ApiOperation({ summary: 'Get ticket by ticket code' })
  @ApiParam({ name: 'code', description: 'Ticket code' })
  findByTicketCode(@Param('code') code: string) {
    return this.ticketsService.findByTicketCode(code);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  findAll(@Query() query: GetTicketsDto) {
    return this.ticketsService.findAll(query);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get tickets for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  findByEvent(
    @Param('eventId') eventId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.ticketsService.findByEvent(eventId, pagination);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tickets for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string, @Query() pagination: PaginationDto) {
    return this.ticketsService.findByUser(userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.getTicketWithDetails(id);
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: 'Regenerate a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @HttpCode(HttpStatus.OK)
  regenerateTicket(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.regenerateTicket(id);
  }

  @Post(':id/email')
  @ApiOperation({ summary: 'Send ticket via email' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @HttpCode(HttpStatus.OK)
  emailTicket(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.emailTicket(id);
  }
}
