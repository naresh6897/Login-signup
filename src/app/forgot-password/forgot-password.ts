import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  step: 'request' | 'verify' | 'reset' = 'request';
  userEmail = '';
  usersdata: any[] = [];
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      securityAnswer: [''],
      newPassword: ['', [
        Validators.maxLength(10),
        Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{1,10}$/)
      ]],
      confirmPassword: ['']
    });
  }

  onRequestReset(): void {
    this.submitted = true;

    if (this.forgotPasswordForm.get('email')?.invalid) {
      return;
    }

    
    const localdata = localStorage.getItem('signupdata');
    this.usersdata = localdata ? JSON.parse(localdata) : [];

    const email = this.forgotPasswordForm.get('email')?.value.trim();
    
    
    this.currentUser = this.usersdata.find(
      (user: any) => user.email === email
    );

    if (!this.currentUser) {
      alert('No account found with this email address.');
      return;
    }

    this.userEmail = email;
    this.step = 'verify';
    this.submitted = false;
    
    alert(`Account found! Username hint: ${this.currentUser.username.substring(0, 2)}***`);
  }

  onVerifyUser(): void {
    this.submitted = true;

    
    const answer = this.forgotPasswordForm.get('securityAnswer')?.value.trim();
    
    if (!answer) {
      return;
    }

    if (answer !== this.currentUser.username) {
      alert('Incorrect username. Please try again.');
      return;
    }

    
    this.step = 'reset';
    this.submitted = false;
  }

  onResetPassword(): void {
    this.submitted = true;

    const newPassword = this.forgotPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.forgotPasswordForm.get('confirmPassword')?.value;

    if (this.forgotPasswordForm.get('newPassword')?.invalid) {
      return;
    }

    if (!confirmPassword) {
      alert('Please confirm your password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    
    const userIndex = this.usersdata.findIndex(
      (user: any) => user.email === this.userEmail
    );

    if (userIndex !== -1) {
      this.usersdata[userIndex].password = newPassword;
      localStorage.setItem('signupdata', JSON.stringify(this.usersdata));
      
      alert('Password reset successful! Please login with your new password.');
      this.router.navigateByUrl('/');
    }
  }

  goBack(): void {
    if (this.step === 'verify') {
      this.step = 'request';
      this.submitted = false;
    } else if (this.step === 'reset') {
      this.step = 'verify';
      this.submitted = false;
    } else {
      this.router.navigateByUrl('/');
    }
  }
}