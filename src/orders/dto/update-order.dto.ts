import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    description: 'Status of the order',
  })
  
  @IsString()
  @IsIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;
}
