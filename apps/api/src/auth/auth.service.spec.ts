import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    createdAt: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('test-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, username: 'testuser' }),
      );
    });

    it('should throw ConflictException if user exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      const result = await service.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.token).toBe('test-token');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.login({
          username: 'nonexistent',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
