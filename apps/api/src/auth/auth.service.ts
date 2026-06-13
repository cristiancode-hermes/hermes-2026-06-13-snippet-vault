import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });
    await this.userRepo.save(user);
    return { token: this.jwtService.sign({ sub: user.id, username: user.username }) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOneBy({ username: dto.username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: this.jwtService.sign({ sub: user.id, username: user.username }) };
  }
}
