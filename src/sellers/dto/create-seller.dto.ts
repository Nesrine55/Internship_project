import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSellerDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the seller',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
@ApiProperty({
    example: 1,
    description: 'ID of the user associated with the seller',
    required: true,
  })
  @IsNumber()
  userId: number;  
}