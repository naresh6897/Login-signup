import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from '../cookie-service';
import { Router, RouterLink } from '@angular/router'; 


type RememberedLogin = { username: string; password: string };

@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './loginpage.html',
  styleUrls: ['./loginpage.css'],
})
export class Loginpage implements OnInit {
  loginform: FormGroup;
  usersdata: any[] = [];
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router 
  ) {
    this.loginform = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required],
        rememberMe: [false],
      },
    );
  }

  ngOnInit(): void {
    
    const localdata = localStorage.getItem('signupdata');
    this.usersdata = localdata ? JSON.parse(localdata) : [];
    
    console.log('Loaded users:', this.usersdata); 

    
    const saved = this.cookieService.get('rememberLogin');
    if (saved) {
      try {
        const parsed: RememberedLogin = JSON.parse(saved);
        this.loginform.patchValue({
          username: parsed.username ?? '',
          password: parsed.password ?? '',
          rememberMe: true,
        });
      } catch {
        this.cookieService.delete('rememberLogin');
      }
    }
  }

  onLogin(): void {
    this.submitted = true; 

    if (this.loginform.invalid) {
      this.loginform.markAllAsTouched();
      return;
    }

    
    const localdata = localStorage.getItem('signupdata');
    this.usersdata = localdata ? JSON.parse(localdata) : [];

    const username = this.loginform.value.username.trim();
    const password = this.loginform.value.password.trim();
    const rememberMe = this.loginform.value.rememberMe;

    console.log('Login attempt:', { username, password }); 
    console.log('Available users:', this.usersdata); 

    
    const ifuserexist = this.usersdata.find(
      (userobj: any) => {
        const match = userobj.username === username && userobj.password === password;
        console.log(`Checking user: ${userobj.username}, Match: ${match}`); 
        return match;
      }
    );

    console.log('User found:', ifuserexist); 

    if (!ifuserexist) {
      alert('Invalid credentials');
      return;
    }

    if (rememberMe) {
      this.cookieService.set(
        'rememberLogin',
        JSON.stringify({ username, password }),
        7
      );
    } else {
      this.cookieService.delete('rememberLogin');
    }

    console.log('Navigating to dashboard...'); 
    
   
    this.router.navigateByUrl('/dashboard').then(
      (success) => console.log('Navigation success:', success),
      (error) => console.error('Navigation error:', error)
    );
  }
}