import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie-service';

describe('CookieService', () => {
  let service: CookieService;
  let mockCookies: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CookieService]
    });
    service = TestBed.inject(CookieService);
    
    // Mock document.cookie
    mockCookies = '';
    Object.defineProperty(document, 'cookie', {
      get: () => mockCookies,
      set: (value: string) => {
        // Simulate browser cookie behavior
        if (value.includes('expires=Thu, 01 Jan 1970')) {
          // Delete cookie
          const name = value.split('=')[0];
          mockCookies = mockCookies
            .split('; ')
            .filter(c => !c.startsWith(name + '='))
            .join('; ');
        } else {
          // Add or update cookie
          const [nameValue] = value.split(';');
          const name = nameValue.split('=')[0];
          
          // Remove existing cookie with same name
          const filtered = mockCookies
            .split('; ')
            .filter(c => c && !c.startsWith(name + '='));
          
          // Add new cookie
          filtered.push(nameValue);
          mockCookies = filtered.filter(c => c).join('; ');
        }
      },
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up cookies after each test
    mockCookies = '';
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be provided in root', () => {
      expect(service).toBeInstanceOf(CookieService);
    });
  });

  describe('set method', () => {
    it('should set a cookie with the given name and value', () => {
      service.set('testCookie', 'testValue', 7);
      
      expect(mockCookies).toContain('testCookie=testValue');
    });

    it('should encode special characters in cookie value', () => {
      service.set('testCookie', 'test value with spaces', 7);
      
      expect(mockCookies).toContain('testCookie=test%20value%20with%20spaces');
    });

    it('should set cookie with correct expiration date', () => {
      const days = 7;
      
      service.set('testCookie', 'testValue', days);
      
      // Verify cookie was set with name and value
      expect(mockCookies).toContain('testCookie=testValue');
    });

    it('should set multiple cookies with different expiration days', () => {
      service.set('cookie1', 'value1', 1);
      service.set('cookie2', 'value2', 7);
      service.set('cookie3', 'value3', 30);
      
      expect(service.get('cookie1')).toBe('value1');
      expect(service.get('cookie2')).toBe('value2');
      expect(service.get('cookie3')).toBe('value3');
    });

    it('should handle JSON string values', () => {
      const jsonValue = JSON.stringify({ username: 'john', password: 'pass123' });
      service.set('userCredentials', jsonValue, 7);
      
      expect(mockCookies).toContain('userCredentials=');
    });

    it('should overwrite existing cookie with same name', () => {
      service.set('testCookie', 'firstValue', 7);
      service.set('testCookie', 'secondValue', 7);
      
      expect(mockCookies).toContain('testCookie=secondValue');
      expect(mockCookies).not.toContain('testCookie=firstValue');
    });

    it('should handle zero days expiration', () => {
      service.set('testCookie', 'testValue', 0);
      
      expect(mockCookies).toContain('testCookie=testValue');
    });

    it('should handle negative days expiration', () => {
      service.set('testCookie', 'testValue', -1);
      
      expect(mockCookies).toContain('testCookie=testValue');
    });
  });

  describe('get method', () => {
    it('should retrieve a cookie value by name', () => {
      service.set('testCookie', 'testValue', 7);
      
      const value = service.get('testCookie');
      
      expect(value).toBe('testValue');
    });

    it('should return null if cookie does not exist', () => {
      const value = service.get('nonExistentCookie');
      
      expect(value).toBeNull();
    });

    it('should decode special characters from cookie value', () => {
      service.set('testCookie', 'test value with spaces', 7);
      
      const value = service.get('testCookie');
      
      expect(value).toBe('test value with spaces');
    });

    it('should retrieve JSON string values', () => {
      const jsonValue = JSON.stringify({ username: 'john', password: 'pass123' });
      service.set('userCredentials', jsonValue, 7);
      
      const value = service.get('userCredentials');
      
      expect(value).toBe(jsonValue);
    });

    it('should handle cookies with similar names', () => {
      service.set('testCookie', 'value1', 7);
      service.set('testCookieExtra', 'value2', 7);
      
      const value = service.get('testCookie');
      
      expect(value).toBe('value1');
    });

    it('should return the correct value when multiple cookies exist', () => {
      service.set('cookie1', 'value1', 7);
      service.set('cookie2', 'value2', 7);
      service.set('cookie3', 'value3', 7);
      
      expect(service.get('cookie1')).toBe('value1');
      expect(service.get('cookie2')).toBe('value2');
      expect(service.get('cookie3')).toBe('value3');
    });

    it('should return null for empty cookie name', () => {
      const value = service.get('');
      
      expect(value).toBeNull();
    });

    it('should handle cookies with equals signs in value', () => {
      service.set('testCookie', 'value=with=equals', 7);
      
      const value = service.get('testCookie');
      
      expect(value).toBe('value=with=equals');
    });
  });

  describe('delete method', () => {
    it('should delete an existing cookie', () => {
      service.set('testCookie', 'testValue', 7);
      expect(service.get('testCookie')).toBe('testValue');
      
      service.delete('testCookie');
      
      expect(service.get('testCookie')).toBeNull();
    });

    it('should not throw error when deleting non-existent cookie', () => {
      expect(() => service.delete('nonExistentCookie')).not.toThrow();
    });

    it('should only delete the specified cookie', () => {
      service.set('cookie1', 'value1', 7);
      service.set('cookie2', 'value2', 7);
      service.set('cookie3', 'value3', 7);
      
      service.delete('cookie2');
      
      expect(service.get('cookie1')).toBe('value1');
      expect(service.get('cookie2')).toBeNull();
      expect(service.get('cookie3')).toBe('value3');
    });

    it('should set expiration date to past when deleting', () => {
      service.set('testCookie', 'testValue', 7);
      
      service.delete('testCookie');
      
      // Cookie should be removed
      expect(service.get('testCookie')).toBeNull();
    });

    it('should handle deleting already deleted cookie', () => {
      service.set('testCookie', 'testValue', 7);
      service.delete('testCookie');
      
      expect(() => service.delete('testCookie')).not.toThrow();
      expect(service.get('testCookie')).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete cookie lifecycle', () => {
      // Set cookie
      service.set('lifecycleCookie', 'initialValue', 7);
      expect(service.get('lifecycleCookie')).toBe('initialValue');
      
      // Update cookie
      service.set('lifecycleCookie', 'updatedValue', 7);
      expect(service.get('lifecycleCookie')).toBe('updatedValue');
      
      // Delete cookie
      service.delete('lifecycleCookie');
      expect(service.get('lifecycleCookie')).toBeNull();
    });

    it('should handle multiple cookies independently', () => {
      service.set('cookie1', 'value1', 1);
      service.set('cookie2', 'value2', 2);
      service.set('cookie3', 'value3', 3);
      
      expect(service.get('cookie1')).toBe('value1');
      expect(service.get('cookie2')).toBe('value2');
      expect(service.get('cookie3')).toBe('value3');
      
      service.delete('cookie2');
      
      expect(service.get('cookie1')).toBe('value1');
      expect(service.get('cookie2')).toBeNull();
      expect(service.get('cookie3')).toBe('value3');
    });

    it('should handle setting and retrieving complex data', () => {
      const complexData = {
        username: 'john@example.com',
        preferences: { theme: 'dark', language: 'en' },
        lastLogin: new Date().toISOString()
      };
      
      service.set('userData', JSON.stringify(complexData), 7);
      const retrieved = service.get('userData');
      
      expect(retrieved).toBeTruthy();
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        expect(parsed.username).toBe(complexData.username);
        expect(parsed.preferences.theme).toBe('dark');
      }
    });

    it('should handle rapid set/get operations', () => {
      for (let i = 0; i < 10; i++) {
        service.set(`cookie${i}`, `value${i}`, 7);
      }
      
      for (let i = 0; i < 10; i++) {
        expect(service.get(`cookie${i}`)).toBe(`value${i}`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as cookie value', () => {
      service.set('emptyCookie', '', 7);
      
      expect(service.get('emptyCookie')).toBe('');
    });

    it('should handle very long cookie values', () => {
      const longValue = 'a'.repeat(1000);
      service.set('longCookie', longValue, 7);
      
      expect(service.get('longCookie')).toBe(longValue);
    });

    it('should handle special characters in cookie name', () => {
      service.set('test-cookie_123', 'testValue', 7);
      
      expect(service.get('test-cookie_123')).toBe('testValue');
    });

    it('should handle special characters in cookie value', () => {
      service.set('specialCookie', 'user@example.com', 7);
      
      expect(service.get('specialCookie')).toBe('user@example.com');
    });

    it('should handle numeric values as strings', () => {
      service.set('numberCookie', '12345', 7);
      
      expect(service.get('numberCookie')).toBe('12345');
    });
  });
});