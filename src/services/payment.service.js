import { paymentService as apiPay } from './api';

export const payment = {
  createOrder: (data) => apiPay.createOrder(data),
  verifySignature: (data) => apiPay.verifySignature(data),
  handlePaymentFailure: (data) => apiPay.handlePaymentFailure(data)
};

export default payment;
