import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerDto } from './create-seller.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSellerDto extends PartialType(CreateSellerDto) {
    @ApiProperty({
    example: 'Updated Name',
    description: 'Updated name of the seller',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 2,
    description: 'Updated user ID for the seller',
    required: false,
  })
  userId?: number;
}
