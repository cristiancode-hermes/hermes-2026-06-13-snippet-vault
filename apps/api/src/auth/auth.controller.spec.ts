import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ token: 'test-token' }),
    login: jest.fn().mockResolvedValue({ token: 'test-token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      const result = await controller.register(dto);
      expect(result).toEqual({ token: 'test-token' });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto = { username: 'testuser', password: 'password123' };
      const result = await controller.login(dto);
      expect(result).toEqual({ token: 'test-token' });
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
