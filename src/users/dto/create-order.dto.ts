import { IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(1)
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}
