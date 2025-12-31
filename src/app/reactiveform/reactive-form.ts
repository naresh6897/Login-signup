import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reactive-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reactive-form.html',
  styleUrls: ['./reactive-form.css'],
})
export class ReactiveForm implements OnInit {
  signup: FormGroup;
  users: any[] = [];
  submitted = false;

  successMsg = '';

  constructor(private fb: FormBuilder) {
    this.signup = this.fb.group(
      {
        fullname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],

        username: ['', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9]+$/)
        ]],

        email: ['', [Validators.required, Validators.email]],

        password: ['', [
          Validators.required,
          Validators.maxLength(10),
          Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{1,10}$/)
        ]],
      },
    );
  }

  ngOnInit(): void {
    const localdata = localStorage.getItem('signupdata');
    this.users = localdata ? JSON.parse(localdata) : [];
    
    console.log('Existing users on load:', this.users);
  }

  onSignup(): void {
    this.submitted = true;
    this.successMsg = ''; 

    this.signup.markAllAsTouched();
    this.signup.updateValueAndValidity();

    if (this.signup.invalid) {
      console.log('Form is invalid');
      return;
    }

    
    const localdata = localStorage.getItem('signupdata');
    this.users = localdata ? JSON.parse(localdata) : [];

    const formData = this.signup.getRawValue();
    
    console.log('Attempting signup:', formData);
    console.log('Current users in storage:', this.users);

   
    const isDuplicateUsername = this.users.some(
      user => user.username === formData.username
    );
    
    const isDuplicateEmail = this.users.some(
      user => user.email === formData.email
    );

    if (isDuplicateUsername) {
      alert('Username already exists! Please choose a different username.');
      return;
    }

    if (isDuplicateEmail) {
      alert('Email already exists! Please use a different email.');
      return;
    }

    
    this.users.push(formData);
    localStorage.setItem('signupdata', JSON.stringify(this.users));
    
    console.log('User added successfully. Total users:', this.users.length);

    
    this.signup.reset({ fullname: '', username: '', email: '', password: '' });
    
    
    this.submitted = false;

    
    this.successMsg = 'Signup successful!';
    console.log('Success message set:', this.successMsg);
    
    
    setTimeout(() => {
      this.successMsg = '';
      console.log('Success message cleared');
    }, 1000);
  }
}