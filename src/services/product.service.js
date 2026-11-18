import { productService } from './api';

export const product = {
  getAll: (params) => productService.getAll(params),
  getById: (id) => productService.getById(id),
  getBySlug: (slug) => productService.getBySlug(slug)
};

export default product;
