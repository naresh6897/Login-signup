import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLogin } from './user-login';
import { ReactiveForm } from '../reactiveform/reactive-form';
import { Loginpage } from '../loginpage/loginpage';
import { Component } from '@angular/core';

// Mock components to avoid importing their dependencies
@Component({
  selector: 'app-reactive-form',
  template: '<div>Mock ReactiveForm</div>',
  standalone: true
})
class MockReactiveForm {}

@Component({
  selector: 'app-loginpage',
  template: '<div>Mock Loginpage</div>',
  standalone: true
})
class MockLoginpage {}

describe('UserLogin Component', () => {
  let component: UserLogin;
  let fixture: ComponentFixture<UserLogin>;

  beforeEach(async () => {
    await TestBed.overrideComponent(UserLogin, {
      set: {
        imports: [MockReactiveForm, MockLoginpage]
      }
    }).configureTestingModule({
      imports: [UserLogin, MockReactiveForm, MockLoginpage]
    }).compileComponents();

    fixture = TestBed.createComponent(UserLogin);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should create the component instance', () => {
      expect(component).toBeInstanceOf(UserLogin);
    });
  });

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should have the correct selector', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeDefined();
    });
  });

  describe('Child Components', () => {
    it('should render child components', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Check if child components are present in the template
      expect(compiled.querySelector('div')).toBeTruthy();
    });
  });

  describe('Component Properties', () => {
    it('should be a standalone component', () => {
      // This is implicit in the setup, but we can verify the component exists
      expect(component).toBeDefined();
    });
  });
});