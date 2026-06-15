import { Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        category: dto.category,
        description: dto.description,
        shortDescription: dto.shortDescription,
        posterImage: dto.posterImage,
        venue: dto.venue,
        mode: dto.mode,
        capacity: dto.capacity,
        date: dto.date ? new Date(dto.date) : null,
        time: dto.time,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
        status: dto.status ?? EventStatus.DRAFT,
        registrationFormType: dto.registrationFormType,
        organizerId: dto.organizerId,
        agenda: dto.agenda
          ? {
              create: dto.agenda.map((item) => ({
                title: item.title,
                speaker: item.speaker,
                startTime: item.startTime,
                endTime: item.endTime,
              })),
            }
          : undefined,
        speakers: dto.speakers
          ? {
              create: dto.speakers.map((item) => ({
                name: item.name,
                role: item.role,
                organization: item.organization,
                bio: item.bio,
                photo: item.photo,
              })),
            }
          : undefined,
        formFields: dto.formFields
          ? {
              create: dto.formFields.map((item, index) => ({
                label: item.label,
                type: item.type,
                isRequired: item.isRequired ?? false,
                fieldOrder: item.fieldOrder ?? index,
                ...(item.options !== undefined && { options: item.options }),
              })),
            }
          : undefined,
      },
      include: {
        agenda: true,
        speakers: true,
        formFields: { orderBy: { fieldOrder: 'asc' } },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search, category, availability, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
          { venue: { contains: search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (category && category !== 'All') {
      andConditions.push({
        category: { equals: category, mode: 'insensitive' as const },
      });
    }

    if (availability && availability !== 'All') {
      if (availability === 'Available') {
        andConditions.push({
          status: { in: ['REGISTRATION_OPEN', 'PUBLISHED'] },
        });
      } else if (availability === 'Full') {
        andConditions.push({
          status: { notIn: ['REGISTRATION_OPEN', 'PUBLISHED'] },
        });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const allowedSortFields = ['createdAt', 'title', 'date', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResponseDto(events, total, page, limit);
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        agenda: { orderBy: { createdAt: 'asc' } },
        speakers: { orderBy: { createdAt: 'asc' } },
        formFields: { orderBy: { fieldOrder: 'asc' } },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  async findByOrganizer(organizerId: string, pagination: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      organizerId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { category: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const allowedSortFields = ['createdAt', 'title', 'date', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResponseDto(events, total, page, limit);
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    if (dto.agenda !== undefined) {
      await this.prisma.eventAgenda.deleteMany({ where: { eventId: id } });
      if (dto.agenda && dto.agenda.length > 0) {
        await this.prisma.eventAgenda.createMany({
          data: dto.agenda.map((item) => ({
            eventId: id,
            title: item.title,
            speaker: item.speaker,
            startTime: item.startTime,
            endTime: item.endTime,
          })),
        });
      }
    }

    if (dto.speakers !== undefined) {
      await this.prisma.eventSpeaker.deleteMany({ where: { eventId: id } });
      if (dto.speakers && dto.speakers.length > 0) {
        await this.prisma.eventSpeaker.createMany({
          data: dto.speakers.map((item) => ({
            eventId: id,
            name: item.name,
            role: item.role,
            organization: item.organization,
            bio: item.bio,
            photo: item.photo,
          })),
        });
      }
    }

    if (dto.formFields !== undefined) {
      await this.prisma.formField.deleteMany({ where: { eventId: id } });
      if (dto.formFields && dto.formFields.length > 0) {
        await Promise.all(
          dto.formFields.map((field, index) =>
            this.prisma.formField.create({
              data: {
                eventId: id,
                label: field.label,
                type: field.type,
                isRequired: field.isRequired ?? false,
                fieldOrder: field.fieldOrder ?? index,
                ...(field.options !== undefined && { options: field.options as any }),
              },
            }),
          ),
        );
      }
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
        ...(dto.posterImage !== undefined && { posterImage: dto.posterImage }),
        ...(dto.venue !== undefined && { venue: dto.venue }),
        ...(dto.mode !== undefined && { mode: dto.mode }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.date !== undefined && { date: dto.date ? new Date(dto.date) : null }),
        ...(dto.time !== undefined && { time: dto.time }),
        ...(dto.registrationDeadline !== undefined && {
          registrationDeadline: dto.registrationDeadline
            ? new Date(dto.registrationDeadline)
            : null,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.registrationFormType !== undefined && { registrationFormType: dto.registrationFormType }),
      },
      include: {
        agenda: true,
        speakers: true,
        formFields: { orderBy: { fieldOrder: 'asc' } },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return this.prisma.event.delete({ where: { id } });
  }

  async archive(id: string) {
    return this.setStatus(id, EventStatus.ARCHIVED);
  }

  async publish(id: string) {
    return this.setStatus(id, EventStatus.PUBLISHED);
  }

  async closeRegistration(id: string) {
    return this.setStatus(id, EventStatus.REGISTRATION_CLOSED);
  }

  async reopenRegistration(id: string) {
    return this.setStatus(id, EventStatus.REGISTRATION_OPEN);
  }

  async duplicate(id: string) {
    const existing = await this.prisma.event.findUnique({
      where: { id },
      include: { agenda: true, speakers: true, formFields: true },
    });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    const {
      id: _oldId,
      createdAt: _oldCreatedAt,
      updatedAt: _oldUpdatedAt,
      ...eventData
    } = existing;

    return this.prisma.event.create({
      data: {
        ...eventData,
        agendaJson: eventData.agendaJson as any,
        speakerDetailsJson: eventData.speakerDetailsJson as any,
        title: `${existing.title} (Copy)`,
        status: EventStatus.DRAFT,
        agenda: {
          create: existing.agenda.map(
            ({ id: _agendaId, eventId: _eid, createdAt: _ac, updatedAt: _au, ...item }) => item,
          ),
        },
        speakers: {
          create: existing.speakers.map(
            ({ id: _speakerId, eventId: _eid, createdAt: _ac, updatedAt: _au, ...item }) => item,
          ),
        },
        formFields: {
          create: existing.formFields.map(
            ({
              id: _fieldId,
              eventId: _eid,
              createdAt: _ac,
              updatedAt: _au,
              options,
              ...rest
            }) => ({
              ...rest,
              ...(options !== null && options !== undefined && { options }),
            }),
          ),
        },
      },
      include: {
        agenda: true,
        speakers: true,
        formFields: { orderBy: { fieldOrder: 'asc' } },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async uploadPoster(id: string, file: Express.Multer.File) {
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { posterImage: file.path },
    });
  }

  // --- Agenda ---

  async addAgenda(eventId: string, dto: CreateAgendaDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.eventAgenda.create({
      data: {
        eventId,
        title: dto.title,
        speaker: dto.speaker,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async updateAgenda(agendaId: string, dto: CreateAgendaDto) {
    const existing = await this.prisma.eventAgenda.findUnique({ where: { id: agendaId } });

    if (!existing) {
      throw new NotFoundException(`Agenda item with ID "${agendaId}" not found`);
    }

    return this.prisma.eventAgenda.update({
      where: { id: agendaId },
      data: {
        title: dto.title,
        speaker: dto.speaker,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async removeAgenda(agendaId: string) {
    const existing = await this.prisma.eventAgenda.findUnique({ where: { id: agendaId } });

    if (!existing) {
      throw new NotFoundException(`Agenda item with ID "${agendaId}" not found`);
    }

    return this.prisma.eventAgenda.delete({ where: { id: agendaId } });
  }

  // --- Speakers ---

  async addSpeaker(eventId: string, dto: CreateSpeakerDto) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    return this.prisma.eventSpeaker.create({
      data: {
        eventId,
        name: dto.name,
        role: dto.role,
        organization: dto.organization,
        bio: dto.bio,
        photo: dto.photo,
      },
    });
  }

  async updateSpeaker(speakerId: string, dto: CreateSpeakerDto) {
    const existing = await this.prisma.eventSpeaker.findUnique({ where: { id: speakerId } });

    if (!existing) {
      throw new NotFoundException(`Speaker with ID "${speakerId}" not found`);
    }

    return this.prisma.eventSpeaker.update({
      where: { id: speakerId },
      data: {
        name: dto.name,
        role: dto.role,
        organization: dto.organization,
        bio: dto.bio,
        photo: dto.photo,
      },
    });
  }

  async removeSpeaker(speakerId: string) {
    const existing = await this.prisma.eventSpeaker.findUnique({ where: { id: speakerId } });

    if (!existing) {
      throw new NotFoundException(`Speaker with ID "${speakerId}" not found`);
    }

    return this.prisma.eventSpeaker.delete({ where: { id: speakerId } });
  }

  // --- Form Fields ---

  async updateFormFields(eventId: string, fields: UpdateFormFieldDto[]) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }

    await this.prisma.formField.deleteMany({ where: { eventId } });

    if (!fields || fields.length === 0) {
      return [];
    }

    const created = await Promise.all(
      fields.map((field, index) =>
        this.prisma.formField.create({
          data: {
            eventId,
            label: field.label!,
            type: field.type!,
            isRequired: field.isRequired ?? false,
            fieldOrder: field.fieldOrder ?? index,
            ...(field.options !== undefined && { options: field.options }),
          },
        }),
      ),
    );

    return created;
  }

  // --- Internal helpers ---

  private async setStatus(id: string, status: EventStatus) {
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { status },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { registrations: true } },
      },
    });
  }
}
