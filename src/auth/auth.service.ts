import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';

import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email, true);
        if (!user) return null;
        if (!user.password) {
            throw new Error('Password missing in database');
          }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) return null;
      
        return user; 
      }
    async register(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return { message: 'Utilisateur créé', userId: user.id };
    }

    async login(user: User) {
        if (!user?.id) {
            throw new Error('User object is invalid');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.generateRefreshToken(payload),
        };
    }

    generateRefreshToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: 'REFRESH_SECRET_KEY',
            expiresIn: '7d',
        });
    }

    async refresh(refreshToken: string) {
        try {
            const user = this.jwtService.verify(refreshToken, {
                secret: 'REFRESH_SECRET_KEY',
            });
            const payload = { email: user.email, sub: user.sub, role: user.role };
            return {
                access_token: this.jwtService.sign(payload),
            };
        } catch (e) {
            throw new UnauthorizedException('Refresh token invalide');
        }
    }
}
