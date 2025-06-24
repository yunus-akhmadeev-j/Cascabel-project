import { apiRequest } from '../common.js';

export class OrderModel {
  constructor() {}

  async submitOrder(orderData) {
    try {
      const response = await apiRequest('/api/orders', 'POST', orderData);
      return response;
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  }
}