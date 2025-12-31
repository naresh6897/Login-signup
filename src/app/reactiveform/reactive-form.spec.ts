import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveForm } from './reactive-form';

describe('ReactiveForm Component', () => {
  let component: ReactiveForm;
  let fixture: ComponentFixture<ReactiveForm>;
  let localStorageMock: { [key: string]: string };

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ReactiveForm]
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the signup form with empty values', () => {
      expect(component.signup).toBeDefined();
      expect(component.signup.get('fullname')?.value).toBe('');
      expect(component.signup.get('username')?.value).toBe('');
      expect(component.signup.get('email')?.value).toBe('');
      expect(component.signup.get('password')?.value).toBe('');
    });

    it('should load existing users from localStorage on init', () => {
      const mockUsers = [
        { fullname: 'John Doe', username: 'john123', email: 'john@example.com', password: 'Pass@123' }
      ];
      localStorageMock['signupdata'] = JSON.stringify(mockUsers);
      
      component.ngOnInit();
      
      expect(component.users).toEqual(mockUsers);
      expect(component.users.length).toBe(1);
    });

    it('should initialize users as empty array if no data in localStorage', () => {
      component.ngOnInit();
      
      expect(component.users).toEqual([]);
    });
  });

  describe('Form Validations', () => {
    describe('Fullname Field', () => {
      it('should be invalid when empty', () => {
        const fullname = component.signup.get('fullname');
        fullname?.setValue('');
        expect(fullname?.hasError('required')).toBe(true);
      });

      it('should be invalid with numbers', () => {
        const fullname = component.signup.get('fullname');
        fullname?.setValue('John123');
        expect(fullname?.hasError('pattern')).toBe(true);
      });

      it('should be invalid with special characters', () => {
        const fullname = component.signup.get('fullname');
        fullname?.setValue('John@Doe');
        expect(fullname?.hasError('pattern')).toBe(true);
      });

      it('should be valid with letters and spaces', () => {
        const fullname = component.signup.get('fullname');
        fullname?.setValue('John Doe');
        expect(fullname?.valid).toBe(true);
      });
    });

    describe('Username Field', () => {
      it('should be invalid when empty', () => {
        const username = component.signup.get('username');
        username?.setValue('');
        expect(username?.hasError('required')).toBe(true);
      });

      it('should be invalid with less than 4 characters', () => {
        const username = component.signup.get('username');
        username?.setValue('abc');
        expect(username?.hasError('minlength')).toBe(true);
      });

      it('should be invalid with more than 10 characters', () => {
        const username = component.signup.get('username');
        username?.setValue('abcdefghijk');
        expect(username?.hasError('maxlength')).toBe(true);
      });

      it('should be invalid with special characters', () => {
        const username = component.signup.get('username');
        username?.setValue('john@123');
        expect(username?.hasError('pattern')).toBe(true);
      });

      it('should be valid with alphanumeric characters between 4-10 length', () => {
        const username = component.signup.get('username');
        username?.setValue('john123');
        expect(username?.valid).toBe(true);
      });
    });

    describe('Email Field', () => {
      it('should be invalid when empty', () => {
        const email = component.signup.get('email');
        email?.setValue('');
        expect(email?.hasError('required')).toBe(true);
      });

      it('should be invalid with incorrect email format', () => {
        const email = component.signup.get('email');
        email?.setValue('invalidemail');
        expect(email?.hasError('email')).toBe(true);
      });

      it('should be valid with correct email format', () => {
        const email = component.signup.get('email');
        email?.setValue('john@example.com');
        expect(email?.valid).toBe(true);
      });
    });

    describe('Password Field', () => {
      it('should be invalid when empty', () => {
        const password = component.signup.get('password');
        password?.setValue('');
        expect(password?.hasError('required')).toBe(true);
      });

      it('should be invalid with more than 10 characters', () => {
        const password = component.signup.get('password');
        password?.setValue('Pass@12345678');
        expect(password?.hasError('maxlength')).toBe(true);
      });

      it('should be invalid without a digit', () => {
        const password = component.signup.get('password');
        password?.setValue('Pass@word');
        expect(password?.hasError('pattern')).toBe(true);
      });

      it('should be invalid without a special character', () => {
        const password = component.signup.get('password');
        password?.setValue('Password1');
        expect(password?.hasError('pattern')).toBe(true);
      });

      it('should be valid with digit and special character within 10 chars', () => {
        const password = component.signup.get('password');
        password?.setValue('Pass@123');
        expect(password?.valid).toBe(true);
      });
    });
  });

  describe('onSignup Method', () => {
    it('should not submit when form is invalid', () => {
      component.signup.patchValue({
        fullname: '',
        username: '',
        email: '',
        password: ''
      });

      component.onSignup();

      expect(component.submitted).toBe(true);
    });

    it('should successfully add a new user when form is valid', () => {
      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(component.users.length).toBe(1);
      expect(component.users[0].username).toBe('john123');
    });

    it('should alert if username already exists', () => {
      spyOn(window, 'alert');
      
      localStorageMock['signupdata'] = JSON.stringify([
        { fullname: 'Jane Doe', username: 'john123', email: 'jane@example.com', password: 'Pass@456' }
      ]);
      
      component.ngOnInit();

      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(window.alert).toHaveBeenCalledWith('Username already exists! Please choose a different username.');
    });

    it('should alert if email already exists', () => {
      spyOn(window, 'alert');
      
      localStorageMock['signupdata'] = JSON.stringify([
        { fullname: 'Jane Doe', username: 'jane123', email: 'john@example.com', password: 'Pass@456' }
      ]);
      
      component.ngOnInit();

      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(window.alert).toHaveBeenCalledWith('Email already exists! Please use a different email.');
    });

    it('should reset form after successful signup', () => {
      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(component.signup.get('fullname')?.value).toBe('');
      expect(component.signup.get('username')?.value).toBe('');
      expect(component.signup.get('email')?.value).toBe('');
      expect(component.signup.get('password')?.value).toBe('');
    });

    it('should set submitted to false after successful signup', () => {
      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(component.submitted).toBe(false);
    });

    it('should set success message after successful signup', () => {
      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(component.successMsg).toBe('Signup successful!');
    });

    it('should clear success message after timeout', (done) => {
      jasmine.clock().install();

      component.signup.patchValue({
        fullname: 'John Doe',
        username: 'john123',
        email: 'john@example.com',
        password: 'Pass@123'
      });

      component.onSignup();

      expect(component.successMsg).toBe('Signup successful!');

      jasmine.clock().tick(1000);

      expect(component.successMsg).toBe('');

      jasmine.clock().uninstall();
      done();
    });
  });
});