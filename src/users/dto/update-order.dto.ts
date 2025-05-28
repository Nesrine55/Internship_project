import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;
}
