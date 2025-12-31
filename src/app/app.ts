import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserLogin } from "./user-login/user-login";
import { Dashboard } from './dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Login-signup');
}
