import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User authentication details not found');
    }
    // user.group is 'CORE' | 'CREW' | 'ENTHUSIAST' from JWT payload
    const hasRole = requiredRoles.includes(user.group);
    if (!hasRole) {
      if (user.group === 'CREW') {
        const path = request.path || request.url || '';
        let requiredPermission = 'manage_announcements'; // default for roadmap/topics
        
        if (path.includes('/services') || path.includes('/manage-regions') || path.includes('/manage-categories')) {
          requiredPermission = 'edit_event';
        } else if (path.includes('/events') || path.includes('/registrations') || path.includes('/tickets') || path.includes('/attendance') || path.includes('/announcements')) {
          requiredPermission = 'create_event';
        } else if (path.includes('/chat')) {
          requiredPermission = 'scan_ticket';
        } else if (path.includes('/analytics')) {
          requiredPermission = 'view_analytics';
        }

        const activePermission = await this.prisma.crewPermission.findFirst({
          where: {
            userId: user.id,
            permission: requiredPermission,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (activePermission) {
          return true;
        }
      }
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return true;
  }
}
