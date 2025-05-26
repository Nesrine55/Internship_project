import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole, { message: 'Role must be admin, seller, or customer' })
  role: UserRole;

  @IsOptional()
  tenantId?: number; 
}
