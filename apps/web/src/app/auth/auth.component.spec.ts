import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ApiService } from '../services/api.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let apiService: any;

  beforeEach(async () => {
    apiService = {
      login: vi.fn().mockResolvedValue({ token: 'test-token' }),
      register: vi.fn().mockResolvedValue({ token: 'test-token' }),
    };

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideRouter([
          { path: 'snippets', component: {} as any },
        ]),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in login mode', () => {
    expect(component.isLogin()).toBe(true);
  });

  it('should toggle between login and register', () => {
    component.toggleMode();
    expect(component.isLogin()).toBe(false);
    component.toggleMode();
    expect(component.isLogin()).toBe(true);
  });

  it('should clear error on toggle', () => {
    component.error.set('Some error');
    component.toggleMode();
    expect(component.error()).toBeNull();
  });

  it('should login with credentials', async () => {
    component.username = 'testuser';
    component.password = 'password123';
    await component.submit();
    expect(apiService.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(component.submitting()).toBe(false);
  });

  it('should register with credentials', async () => {
    component.isLogin.set(false);
    component.username = 'newuser';
    component.email = 'new@test.com';
    component.password = 'password123';
    await component.submit();
    expect(apiService.register).toHaveBeenCalledWith('newuser', 'new@test.com', 'password123');
  });

  it('should not submit without username and password', async () => {
    component.username = '';
    component.password = '';
    await component.submit();
    expect(apiService.login).not.toHaveBeenCalled();
  });

  it('should handle auth errors', async () => {
    apiService.login.mockRejectedValue({ error: { message: 'Invalid credentials' } });
    component.username = 'testuser';
    component.password = 'wrong';
    await component.submit();
    expect(component.error()).toBe('Invalid credentials');
  });

  it('should handle generic errors', async () => {
    apiService.login.mockRejectedValue(new Error('Network error'));
    component.username = 'testuser';
    component.password = 'password123';
    await component.submit();
    expect(component.error()).toBe('Network error');
  });
});
