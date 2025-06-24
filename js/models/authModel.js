import { apiRequest } from '../common.js';

export class AuthModel {
  constructor() {}

  async login(identifier, password) {
    try {
      const data = await apiRequest('/api/users/login', 'POST', { identifier, password });
      if (!data.user) {
        throw new Error('User data not received');
      }
      return data.user;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  async register(user) {
    try {
      const data = await apiRequest('/api/users/register', 'POST', user);
      if (!data.user) {
        throw new Error('User data not received');
      }
      return data.user;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  }
}