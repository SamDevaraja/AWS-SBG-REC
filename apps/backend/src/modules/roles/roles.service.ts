import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions ?? [],
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!role) {
      throw new NotFoundException(`Role "${name}" not found`);
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });

      if (nameTaken) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.permissions !== undefined && { permissions: dto.permissions }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.role.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!existing) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (existing.users.length > 0) {
      throw new BadRequestException(
        `Cannot delete role "${existing.name}" because ${existing.users.length} user(s) are assigned to it. Remove all user assignments first.`,
      );
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
