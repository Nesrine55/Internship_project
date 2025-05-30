import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'Name of the tenant',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}