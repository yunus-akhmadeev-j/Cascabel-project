import { apiRequest } from '../common.js';

export class OrdersListModel {
  async getOpenOrders() {
    try {
      const orders = await apiRequest('/api/orders?status=Open');
      return orders;
    } catch (error) {
      console.error('Error fetching open orders:', error);
      throw error;
    }
  }

  async getTakenOrders(designerName) {
    try {
      const orders = await apiRequest(`/api/orders?designer=${encodeURIComponent(designerName)}`);
      return orders.filter(order => order.status === 'In Progress' || order.status === 'Under Review');
    } catch (error) {
      console.error('Error fetching taken orders:', error);
      throw error;
    }
  }

  async getCompletedOrders(designerName) {
    try {
      const orders = await apiRequest(`/api/orders?designer=${encodeURIComponent(designerName)}&status=Completed`);
      return orders;
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }

  async getAllTakenOrders() {
    try {
      const orders = await apiRequest('/api/orders');
      return orders.filter(order => order.status === 'In Progress' || order.status === 'Under Review');
    } catch (error) {
      console.error('Error fetching taken orders:', error);
      throw error;
    }
  }

  async getAllCompletedOrders() {
    try {
      const orders = await apiRequest('/api/orders?status=Completed');
      return orders;
    } catch (error) {
      console.error('Error fetching all completed orders:', error);
      throw error;
    }
  }

  async takeOrder(orderId, designerName) {
    try {
      const updatedOrder = await apiRequest(`/api/orders/${orderId}/take`, 'PUT', { designer: designerName });
      return updatedOrder;
    } catch (error) {
      console.error('Error taking order:', error);
      throw error;
    }
  }
}