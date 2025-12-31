import { Routes } from '@angular/router';
import { UserLogin } from './user-login/user-login';
import { Dashboard} from './dashboard/dashboard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
export const routes: Routes = [

  { path: '', component: UserLogin },
  { path: 'dashboard', component: Dashboard },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '' }
];
