import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Ticket code to check in' })
  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @ApiProperty({ description: 'Scanner ID or crew member marking attendance', required: false })
  @IsString()
  @IsOptional()
  scannerId?: string;
}
