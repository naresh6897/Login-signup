import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password';
import { Component } from '@angular/core';


@Component({
  selector: 'a[routerLink]',
  template: '<ng-content></ng-content>',
  standalone: true
})
class MockRouterLinkDirective {}

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let localStorageMock: { [key: string]: string };

  beforeEach(async () => {
   
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    
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

   
    await TestBed.overrideComponent(ForgotPasswordComponent, {
      set: {
        imports: [ReactiveFormsModule, MockRouterLinkDirective, CommonModule]
      }
    }).configureTestingModule({
      imports: [ReactiveFormsModule, ForgotPasswordComponent, MockRouterLinkDirective, CommonModule],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    
   
    mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with request step', () => {
      expect(component.step).toBe('request');
    });

    it('should initialize submitted as false', () => {
      expect(component.submitted).toBe(false);
    });

    it('should initialize the forgot password form with required fields', () => {
      fixture.detectChanges();
      
      expect(component.forgotPasswordForm).toBeDefined();
      expect(component.forgotPasswordForm.get('email')).toBeDefined();
      expect(component.forgotPasswordForm.get('securityAnswer')).toBeDefined();
      expect(component.forgotPasswordForm.get('newPassword')).toBeDefined();
      expect(component.forgotPasswordForm.get('confirmPassword')).toBeDefined();
    });

    it('should initialize form with empty values', () => {
      fixture.detectChanges();
      
      expect(component.forgotPasswordForm.get('email')?.value).toBe('');
      expect(component.forgotPasswordForm.get('securityAnswer')?.value).toBe('');
      expect(component.forgotPasswordForm.get('newPassword')?.value).toBe('');
      expect(component.forgotPasswordForm.get('confirmPassword')?.value).toBe('');
    });

    it('should initialize usersdata as empty array', () => {
      expect(component.usersdata).toEqual([]);
    });

    it('should initialize currentUser as null', () => {
      expect(component.currentUser).toBeNull();
    });

    it('should initialize userEmail as empty string', () => {
      expect(component.userEmail).toBe('');
    });
  });

  describe('Form Validations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should mark email as invalid when empty', () => {
      const email = component.forgotPasswordForm.get('email');
      email?.setValue('');
      
      expect(email?.hasError('required')).toBe(true);
      expect(email?.valid).toBe(false);
    });

    it('should mark email as invalid with incorrect format', () => {
      const email = component.forgotPasswordForm.get('email');
      email?.setValue('invalidemail');
      
      expect(email?.hasError('email')).toBe(true);
      expect(email?.valid).toBe(false);
    });

    it('should mark email as valid with correct format', () => {
      const email = component.forgotPasswordForm.get('email');
      email?.setValue('test@example.com');
      
      expect(email?.valid).toBe(true);
    });

    it('should validate new password with pattern', () => {
      const password = component.forgotPasswordForm.get('newPassword');
      
      
      password?.setValue('pass123');
      expect(password?.hasError('pattern')).toBe(true);
      
      
      password?.setValue('pass@word');
      expect(password?.hasError('pattern')).toBe(true);
      
      
      password?.setValue('Pass@123');
      expect(password?.valid).toBe(true);
    });

    it('should validate new password max length', () => {
      const password = component.forgotPasswordForm.get('newPassword');
      
      password?.setValue('Pass@123456');
      
      expect(password?.hasError('maxlength')).toBe(true);
    });

    it('should accept valid password within max length', () => {
      const password = component.forgotPasswordForm.get('newPassword');
      password?.setValue('Pass@123');
      
      expect(password?.valid).toBe(true);
    });
  });

  describe('onRequestReset Method', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set submitted to true when reset is requested', () => {
      component.forgotPasswordForm.patchValue({
        email: ''
      });
      
      component.onRequestReset();
      
      expect(component.submitted).toBe(true);
    });

    it('should not proceed if email is invalid', () => {
      component.forgotPasswordForm.patchValue({
        email: 'invalidemail'
      });
      
      component.onRequestReset();
      
      expect(component.step).toBe('request');
    });

    it('should load users data from localStorage', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      spyOn(window, 'alert');
      component.onRequestReset();
      
      expect(component.usersdata).toEqual(mockUsers);
    });

    it('should alert if no account found with email', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'nonexistent@example.com'
      });
      
      component.onRequestReset();
      
      expect(window.alert).toHaveBeenCalledWith('No account found with this email address.');
      expect(component.step).toBe('request');
    });

    it('should move to verify step if user found', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      component.onRequestReset();
      
      expect(component.step).toBe('verify');
      expect(component.userEmail).toBe('john@example.com');
      expect(component.currentUser).toEqual(mockUsers[0]);
    });

    it('should show username hint when user found', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      component.onRequestReset();
      
      expect(window.alert).toHaveBeenCalledWith('Account found! Username hint: jo***');
    });

    it('should handle email with extra whitespace', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      component.onRequestReset();
      
      
      expect(component.step).toBe('verify');
      expect(component.userEmail).toBe('john@example.com');
    });

    it('should reset submitted flag when moving to verify step', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      component.onRequestReset();
      
      expect(component.submitted).toBe(false);
    });

    it('should handle empty localStorage gracefully', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      
      component.onRequestReset();
      
      expect(component.usersdata).toEqual([]);
      expect(window.alert).toHaveBeenCalledWith('No account found with this email address.');
    });
  });

  describe('onVerifyUser Method', () => {
    beforeEach(() => {
      fixture.detectChanges();
      

      component.currentUser = { 
        fullname: 'John Doe', 
        username: 'john123', 
        email: 'john@example.com', 
        password: 'Pass@123' 
      };
      component.step = 'verify';
    });

    it('should set submitted to true when verification is attempted', () => {
      component.forgotPasswordForm.patchValue({
        securityAnswer: ''
      });
      
      component.onVerifyUser();
      
      expect(component.submitted).toBe(true);
    });

    it('should not proceed if security answer is empty', () => {
      component.forgotPasswordForm.patchValue({
        securityAnswer: ''
      });
      
      component.onVerifyUser();
      
      expect(component.step).toBe('verify');
    });

    it('should alert if username is incorrect', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        securityAnswer: 'wrongusername'
      });
      
      component.onVerifyUser();
      
      expect(window.alert).toHaveBeenCalledWith('Incorrect username. Please try again.');
      expect(component.step).toBe('verify');
    });

    it('should move to reset step if username is correct', () => {
      component.forgotPasswordForm.patchValue({
        securityAnswer: 'john123'
      });
      
      component.onVerifyUser();
      
      expect(component.step).toBe('reset');
      expect(component.submitted).toBe(false);
    });

    it('should trim security answer before verification', () => {
      component.forgotPasswordForm.patchValue({
        securityAnswer: '  john123  '
      });
      
      component.onVerifyUser();
      
      expect(component.step).toBe('reset');
    });

    it('should be case-sensitive for username verification', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        securityAnswer: 'JOHN123'
      });
      
      component.onVerifyUser();
      
      expect(window.alert).toHaveBeenCalledWith('Incorrect username. Please try again.');
    });
  });

  describe('onResetPassword Method', () => {
    beforeEach(() => {
      fixture.detectChanges();
      
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.usersdata = mockUsers;
      component.currentUser = mockUsers[0];
      component.userEmail = 'john@example.com';
      component.step = 'reset';
    });

    it('should set submitted to true when reset is attempted', () => {
      component.forgotPasswordForm.patchValue({
        newPassword: '',
        confirmPassword: ''
      });
      
      component.onResetPassword();
      
      expect(component.submitted).toBe(true);
    });

    it('should not proceed if new password is invalid', () => {
      component.forgotPasswordForm.patchValue({
        newPassword: 'invalid',
        confirmPassword: 'invalid'
      });
      
      component.onResetPassword();
      
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should alert if confirm password is empty', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'Pass@123',
        confirmPassword: ''
      });
      
      component.onResetPassword();
      
      expect(window.alert).toHaveBeenCalledWith('Please confirm your password.');
    });

    it('should alert if passwords do not match', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'Pass@123',
        confirmPassword: 'Pass@456'
      });
      
      component.onResetPassword();
      
      expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
    });

    it('should update password in localStorage if passwords match', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@123',
        confirmPassword: 'New@123'
      });
      
      component.onResetPassword();
      
      const updatedUsers = JSON.parse(localStorageMock['signupdata']);
      expect(updatedUsers[0].password).toBe('New@123');
    });

    it('should navigate to home after successful password reset', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@123',
        confirmPassword: 'New@123'
      });
      
      component.onResetPassword();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should show success message after password reset', () => {
      spyOn(window, 'alert');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@123',
        confirmPassword: 'New@123'
      });
      
      component.onResetPassword();
      
      expect(window.alert).toHaveBeenCalledWith('Password reset successful! Please login with your new password.');
    });

    it('should handle user not found in localStorage', () => {
      component.userEmail = 'nonexistent@example.com';
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@123',
        confirmPassword: 'New@123'
      });
      
      component.onResetPassword();
      
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should update correct user when multiple users exist', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' },
        { fullname: 'Jane Smith', username: 'jane456', email: 'jane@example.com', password: 'Jane@456' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      component.usersdata = mockUsers;
      component.userEmail = 'jane@example.com';
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@456',
        confirmPassword: 'New@456'
      });
      
      component.onResetPassword();
      
      const updatedUsers = JSON.parse(localStorageMock['signupdata']);
      expect(updatedUsers[0].password).toBe('Pass@123'); 
      expect(updatedUsers[1].password).toBe('New@456'); 
    });
  });

  describe('goBack Method', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to home from request step', () => {
      component.step = 'request';
      
      component.goBack();
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should go back to request step from verify step', () => {
      component.step = 'verify';
      component.submitted = true;
      
      component.goBack();
      
      expect(component.step).toBe('request');
      expect(component.submitted).toBe(false);
    });

    it('should go back to verify step from reset step', () => {
      component.step = 'reset';
      component.submitted = true;
      
      component.goBack();
      
      expect(component.step).toBe('verify');
      expect(component.submitted).toBe(false);
    });

    it('should reset submitted flag when going back', () => {
      component.step = 'verify';
      component.submitted = true;
      
      component.goBack();
      
      expect(component.submitted).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock['signupdata'] = 'invalid-json';
      
      component.forgotPasswordForm.patchValue({
        email: 'test@example.com'
      });
      
      expect(() => component.onRequestReset()).toThrow();
    });

    it('should handle empty signupdata in localStorage', () => {
      spyOn(window, 'alert');
      localStorageMock['signupdata'] = '';
      
      component.forgotPasswordForm.patchValue({
        email: 'test@example.com'
      });
      
      component.onRequestReset();
      
      expect(component.usersdata).toEqual([]);
    });

    it('should handle password validation edge cases', () => {
      const password = component.forgotPasswordForm.get('newPassword');
      
      
      password?.setValue('Pass@12345');
      expect(password?.valid).toBe(true);
      
      
      password?.setValue('Pass@123456');
      expect(password?.hasError('maxlength')).toBe(true);
    });

    it('should handle email with uppercase characters', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.forgotPasswordForm.patchValue({
        email: 'John@Example.COM'
      });
      
      component.onRequestReset();
      
      
      expect(window.alert).toHaveBeenCalledWith('No account found with this email address.');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full password reset flow', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      
      component.forgotPasswordForm.patchValue({
        email: 'john@example.com'
      });
      component.onRequestReset();
      expect(component.step).toBe('verify');
      
      
      component.forgotPasswordForm.patchValue({
        securityAnswer: 'john123'
      });
      component.onVerifyUser();
      expect(component.step).toBe('reset');
      
      component.forgotPasswordForm.patchValue({
        newPassword: 'New@123',
        confirmPassword: 'New@123'
      });
      component.onResetPassword();
      
      const updatedUsers = JSON.parse(localStorageMock['signupdata']);
      expect(updatedUsers[0].password).toBe('New@123');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('should allow going back and forth between steps', () => {
      spyOn(window, 'alert');
      
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      
      component.forgotPasswordForm.patchValue({ email: 'john@example.com' });
      component.onRequestReset();
      expect(component.step).toBe('verify');
      
    
      component.goBack();
      expect(component.step).toBe('request');
      
     
      component.forgotPasswordForm.patchValue({ email: 'john@example.com' });
      component.onRequestReset();
      expect(component.step).toBe('verify');
      
      
      component.forgotPasswordForm.patchValue({ securityAnswer: 'john123' });
      component.onVerifyUser();
      expect(component.step).toBe('reset');
      
      
      component.goBack();
      expect(component.step).toBe('verify');
    });
  });
});