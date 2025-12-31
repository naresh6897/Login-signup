import { Component } from '@angular/core';
import { ReactiveForm } from '../reactiveform/reactive-form';
import { Loginpage } from '../loginpage/loginpage';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveForm, Loginpage],
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
})
export class UserLogin {}
