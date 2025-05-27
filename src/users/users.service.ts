import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';


import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { email },
      relations: ['tenant'],
    };

    if (withPassword) {
      options.select = ['id', 'email', 'password', 'role','tenantId'];
    }else {
    options.select = ['id', 'email', 'role', 'tenantId']; 
  }

    return this.usersRepository.findOne(options);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'role']
    });
  }

  async findById(id: number): Promise<User | null> {
  return this.usersRepository.findOne({
    where: { id },
    relations: ['tenant'], 
  });
}
}
