import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Name is too long' })

  name: string;

  @IsString()
  @MaxLength(200, { message: 'Description is too long' })

  description: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  price: number;
}
