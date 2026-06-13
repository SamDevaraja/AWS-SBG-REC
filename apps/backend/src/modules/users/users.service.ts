import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

const BCRYPT_SALT_ROUNDS = 10;
const ALLOWED_SORT_FIELDS = ['createdAt', 'firstName', 'lastName', 'email'];
const SENSITIVE_FIELDS = ['password', 'refreshToken', 'resetToken', 'resetTokenExp'] as const;

type UserWithoutSensitive<T> = Omit<T, (typeof SENSITIVE_FIELDS)[number]>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitizeUser<T extends Record<string, unknown>>(user: T): UserWithoutSensitive<T> {
    const sanitized = { ...user };
    for (const field of SENSITIVE_FIELDS) {
      delete sanitized[field];
    }
    return sanitized as UserWithoutSensitive<T>;
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone || null,
        roles: dto.roleIds
          ? {
              create: dto.roleIds.map((roleId) => ({
                roleId,
              })),
            }
          : undefined,
      },
      include: { roles: { include: { role: true } } },
    });

    return this.sanitizeUser(user);
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: { roles: { include: { role: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitizedUsers = users.map((user) => this.sanitizeUser(user));

    return new PaginatedResponseDto(sanitizedUsers, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      email?: string;
      password?: string;
      roles?: { create: { roleId: string }[] };
    } = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
    };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }

    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      updateData.roles = {
        create: dto.roleIds.map((roleId) => ({
          roleId,
        })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { roles: { include: { role: true } } },
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async assignRole(userId: string, dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: dto.roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ConflictException('User already has this role');
    }

    const userRole = await this.prisma.userRole.create({
      data: {
        userId,
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    return userRole;
  }

  async removeRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return { message: 'Role removed from user successfully' };
  }

  async activate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: { roles: { include: { role: true } } },
    });

    return this.sanitizeUser(updatedUser);
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { roles: { include: { role: true } } },
    });

    return this.sanitizeUser(updatedUser);
  }
}
