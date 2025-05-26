import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async register(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return { message: 'Utilisateur créé', userId: user.id };
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
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
