import { categoryService } from './api';

export const category = {
  getAll: () => categoryService.getAll(),
  getBySlug: (slug) => categoryService.getBySlug(slug)
};

export default category;
