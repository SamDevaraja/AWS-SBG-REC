import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import configuration from '@/config/configuration';
import { PrismaModule } from '@/database/prisma.module';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import { PrismaExceptionFilter } from '@/shared/filters/prisma-exception.filter';
import { UsersModule } from '@/modules/users/users.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { EventsModule } from '@/modules/events/events.module';
import { RegistrationsModule } from '@/modules/registrations/registrations.module';
import { TicketsModule } from '@/modules/tickets/tickets.module';
import { AttendanceModule } from '@/modules/attendance/attendance.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { AuditLogsModule } from '@/modules/audit-logs/audit-logs.module';
import { AnnouncementsModule } from '@/modules/announcements/announcements.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CrewModule } from '@/modules/crew/crew.module';
import { FeedModule } from '@/modules/feed/feed.module';
import { JobsModule } from '@/modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    RolesModule,
    EventsModule,
    RegistrationsModule,
    TicketsModule,
    AttendanceModule,
    NotificationsModule,
    AnalyticsModule,
    AuditLogsModule,
    AnnouncementsModule,
    AuthModule,
    CrewModule,
    FeedModule,
    JobsModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
