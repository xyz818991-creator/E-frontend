import { authService } from './api';

export const auth = {
  login: (email, password) => authService.login({ email, password }),
  register: (userData) => authService.register(userData),
  getMe: () => authService.getMe()
};

export default auth;
