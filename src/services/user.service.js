import { userService } from './api';

export const user = {
  getProfile: () => userService.getProfile(),
  updateProfile: (data) => userService.updateProfile(data)
};

export default user;
