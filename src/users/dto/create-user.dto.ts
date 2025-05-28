import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
    @MinLength(6, { message: 'Password is too short. Minimum 6 characters required.' })

  password: string;

  @IsEnum(UserRole, { message: 'Role must be admin, seller, or customer' })
  role: UserRole;

  @IsOptional()
  tenantId?: number; 
}
