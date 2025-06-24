import { apiRequest } from '../common.js';

export class ReviewsModel {
  constructor() {}

  async getReviews() {
    try {
      return await apiRequest('/api/reviews');
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async addReview(review) {
    try {
      return await apiRequest('/api/reviews', 'POST', review);
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  async getCompletedOrders(clientName) {
    try {
      // Запрашиваем завершённые заказы для указанного клиента
      const orders = await apiRequest(`/api/orders?client=${clientName}&status=Completed`);
      // Возвращаем массив ID заказов для выпадающего списка
      return orders.map(order => order.id);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      return [];
    }
  }
}