import { orderService } from './api';

export const order = {
  create: (data) => orderService.create(data),
  getMyOrders: () => orderService.getMyOrders(),
  getById: (id) => orderService.getById(id),
  track: (orderNumber) => orderService.track(orderNumber)
};

export default order;
