import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  userId: number;


  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  productId: number;

  
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
