import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_SALT_ROUNDS = 10;

// ── 3 platform groups — all internal DB roles map to one of these ──
const CORE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'];
const CREW_ROLES = ['VOLUNTEER', 'SCANNER'];
// ENTHUSIAST = default for all other users

function computePortal(roleNames: string[]): { group: string; redirectTo: string } {
  if (roleNames.some((r) => CORE_ROLES.includes(r))) return { group: 'CORE', redirectTo: '/core/dashboard' };
  if (roleNames.some((r) => CREW_ROLES.includes(r))) return { group: 'CREW', redirectTo: '/crew/dashboard' };
  return { group: 'ENTHUSIAST', redirectTo: '/events' };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account deactivated. Contact support.');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const roleNames = user.roles.map((ur) => ur.role.name);
    const { group, redirectTo } = computePortal(roleNames);

    // Issue JWT access token for roadmap API
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      group,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      group,       // 'CORE' | 'CREW' | 'ENTHUSIAST'
      redirectTo,
      accessToken, // JWT for roadmap endpoints
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Ensure ENTHUSIAST role exists in DB (upsert — idempotent)
    const enthusiastRole = await this.prisma.role.upsert({
      where: { name: 'ENTHUSIAST' },
      update: {},
      create: {
        name: 'ENTHUSIAST',
        description: 'Default public event participant role',
        permissions: [],
      },
    });

    // Create user and immediately assign ENTHUSIAST role
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: hashedPassword,
        roles: { create: [{ roleId: enthusiastRole.id }] },
      },
      include: { roles: { include: { role: true } } },
    });

    const roleNames = user.roles.map((ur) => ur.role.name);
    const { group, redirectTo } = computePortal(roleNames);

    // Issue JWT access token for roadmap API
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      group,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roleNames,
      group,
      redirectTo,
      accessToken, // JWT for roadmap endpoints
      message: 'Account created successfully.',
    };
  }
}
