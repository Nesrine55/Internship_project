import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto{
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string; 
}