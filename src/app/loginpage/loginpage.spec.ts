import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Loginpage } from './loginpage';
import { CookieService } from '../cookie-service';
import { Component } from '@angular/core';

// Create a mock RouterLink directive
@Component({
  selector: 'a[routerLink]',
  template: '<ng-content></ng-content>',
  standalone: true
})
class MockRouterLinkDirective {}

describe('Loginpage Component', () => {
  let component: Loginpage;
  let fixture: ComponentFixture<Loginpage>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let localStorageMock: { [key: string]: string };

  beforeEach(async () => {
    // Create mock services
    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete']);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    // Mock localStorage
    localStorageMock = {};
    
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return localStorageMock[key] || null;
    });
    
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    
    spyOn(localStorage, 'clear').and.callFake(() => {
      localStorageMock = {};
    });

    // Override the component's imports to replace RouterLink with mock
    await TestBed.overrideComponent(Loginpage, {
      set: {
        imports: [ReactiveFormsModule, MockRouterLinkDirective]
      }
    }).configureTestingModule({
      imports: [ReactiveFormsModule, Loginpage, MockRouterLinkDirective],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Loginpage);
    component = fixture.componentInstance;
    
    // Reset mocks before each test
    mockCookieService.get.and.returnValue(null);
    mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the login form with empty values', () => {
      fixture.detectChanges();
      
      expect(component.loginform).toBeDefined();
      expect(component.loginform.get('username')?.value).toBe('');
      expect(component.loginform.get('password')?.value).toBe('');
      expect(component.loginform.get('rememberMe')?.value).toBe(false);
    });

    it('should load users data from localStorage on init', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      fixture.detectChanges();
      
      expect(component.usersdata).toEqual(mockUsers);
      expect(component.usersdata.length).toBe(1);
    });

    it('should initialize usersdata as empty array if no data in localStorage', () => {
      fixture.detectChanges();
      
      expect(component.usersdata).toEqual([]);
    });

    it('should load saved credentials if "Remember Me" cookie exists', () => {
      const savedCredentials = JSON.stringify({ username: 'john123', password: 'Pass@123' });
      mockCookieService.get.and.returnValue(savedCredentials);
      
      fixture.detectChanges();
      
      expect(component.loginform.get('username')?.value).toBe('john123');
      expect(component.loginform.get('password')?.value).toBe('Pass@123');
      expect(component.loginform.get('rememberMe')?.value).toBe(true);
    });

    it('should delete invalid cookie data if parsing fails', () => {
      mockCookieService.get.and.returnValue('invalid-json');
      
      fixture.detectChanges();
      
      expect(mockCookieService.delete).toHaveBeenCalledWith('rememberLogin');
    });
  });

  describe('Form Validations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark username as invalid when empty', () => {
      const username = component.loginform.get('username');
      username?.setValue('');
      
      expect(username?.hasError('required')).toBe(true);
      expect(username?.valid).toBe(false);
    });

    it('should mark password as invalid when empty', () => {
      const password = component.loginform.get('password');
      password?.setValue('');
      
      expect(password?.hasError('required')).toBe(true);
      expect(password?.valid).toBe(false);
    });

    it('should mark username as valid when it has a value', () => {
      const username = component.loginform.get('username');
      username?.setValue('john123');
      
      expect(username?.valid).toBe(true);
    });

    it('should mark password as valid when it has a value', () => {
      const password = component.loginform.get('password');
      password?.setValue('Pass@123');
      
      expect(password?.valid).toBe(true);
    });

    it('should mark form as invalid when both fields are empty', () => {
      component.loginform.patchValue({
        username: '',
        password: ''
      });
      
      expect(component.loginform.invalid).toBe(true);
    });

    it('should mark form as valid when both fields have values', () => {
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123'
      });
      
      expect(component.loginform.valid).toBe(true);
    });
  });

  describe('onLogin Method', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set submitted to true when login is attempted', () => {
      component.loginform.patchValue({
        username: '',
        password: ''
      });
      
      component.onLogin();
      
      expect(component.submitted).toBe(true);
    });

    it('should not proceed if form is invalid', () => {
      component.loginform.patchValue({
        username: '',
        password: ''
      });
      
      component.onLogin();
      
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.loginform.patchValue({
        username: '',
        password: ''
      });
      
      spyOn(component.loginform, 'markAllAsTouched');
      
      component.onLogin();
      
      expect(component.loginform.markAllAsTouched).toHaveBeenCalled();
    });

    it('should alert if credentials are invalid', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'wronguser',
        password: 'wrongpass'
      });
      
      component.onLogin();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should successfully login with valid credentials', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123',
        rememberMe: false
      });
      
      component.onLogin();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should trim username and password before validation', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: '  john123  ',
        password: '  Pass@123  ',
        rememberMe: false
      });
      
      component.onLogin();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should save credentials to cookie when "Remember Me" is checked', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123',
        rememberMe: true
      });
      
      component.onLogin();
      
      expect(mockCookieService.set).toHaveBeenCalledWith(
        'rememberLogin',
        JSON.stringify({ username: 'john123', password: 'Pass@123' }),
        7
      );
    });

    it('should delete cookie when "Remember Me" is not checked', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123',
        rememberMe: false
      });
      
      component.onLogin();
      
      expect(mockCookieService.delete).toHaveBeenCalledWith('rememberLogin');
    });

    it('should reload users data from localStorage before validation', () => {
      // Initially empty
      component.usersdata = [];
      
      // Add user to localStorage after component init
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123'
      });
      
      component.onLogin();
      
      expect(component.usersdata.length).toBe(1);
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle case-sensitive username matching', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'JOHN123', // Different case
        password: 'Pass@123'
      });
      
      component.onLogin();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle case-sensitive password matching', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'pass@123' // Different case
      });
      
      component.onLogin();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle multiple users in localStorage', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' },
        { fullname: 'Jane Smith', username: 'jane456', email: 'jane@example.com', password: 'Jane@456' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.loginform.patchValue({
        username: 'jane456',
        password: 'Jane@456'
      });
      
      component.onLogin();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle empty localStorage gracefully', () => {
      localStorageMock['signupdata'] = '';
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123'
      });
      
      spyOn(window, 'alert');
      component.onLogin();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock['signupdata'] = 'invalid-json';
      
      expect(() => {
        component.ngOnInit();
      }).toThrow();
    });

    it('should handle navigation promise rejection', async () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      mockRouter.navigateByUrl.and.returnValue(Promise.reject('Navigation failed'));
      
      component.loginform.patchValue({
        username: 'john123',
        password: 'Pass@123'
      });
      
      component.onLogin();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });
  });
});