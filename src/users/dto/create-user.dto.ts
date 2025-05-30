import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'User password (min 6 chars)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password is too short. Minimum 6 characters required.' })

  password: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', example: UserRole.CUSTOMER })
  @IsEnum(UserRole, { message: 'Role must be admin, seller, or customer' })
  role: UserRole;

  @ApiProperty({ required: false, example: 1, description: 'Tenant ID (optional)' })
  @IsOptional()
  tenantId?: number;
}
