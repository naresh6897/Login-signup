import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  set(name: string, value: string, days: number): void {
    const d = new Date();
    d.setDate(d.getDate() + days);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
  }

  get(name: string): string | null {
    const cookies = document.cookie.split('; ');
    const found = cookies.find(c => c.startsWith(name + '='));
    return found ? decodeURIComponent(found.split('=')[1]) : null;
  }

  delete(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
}
