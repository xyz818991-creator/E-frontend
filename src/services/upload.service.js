import { adminService } from './api';

export const upload = {
  uploadSingle: (formData) => adminService.uploadImage(formData),
  uploadMultiple: (formData) => adminService.uploadMultiple(formData),
  deleteMedia: (data) => adminService.deleteMedia(data)
};

export default upload;
