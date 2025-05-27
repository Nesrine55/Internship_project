import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  userId: number;  
}