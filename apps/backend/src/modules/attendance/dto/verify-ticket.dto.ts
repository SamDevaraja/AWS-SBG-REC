import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTicketDto {
  @ApiProperty({ description: 'Ticket code to verify' })
  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @ApiProperty({ description: 'Scanner device/user ID' })
  @IsString()
  @IsNotEmpty()
  scannerId: string;
}
