import { IsString, IsNotEmpty, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Widget', description: 'Product name', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ 
    example: 'High quality widget', 
    description: 'Product description', 
    required: false,
    maxLength: 200 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ example: 100, description: 'Available stock quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 29.99, description: 'Product price', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;
}