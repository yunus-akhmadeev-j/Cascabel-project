import { apiRequest } from '../common.js';

export class AdminModel {
  constructor() {
    this.users = [];
    this.orders = [];
    this.works = [];
    this.reviews = [];
  }

  async getAllUsers() {
    try {
      const users = await apiRequest('/api/users');
      this.users = users;
      return this.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async toggleUserBlock(userId) {
    try {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        const isBlocked = !user.is_blocked; // Используем is_blocked для соответствия БД
        const updatedUser = await apiRequest(`/api/users/${encodeURIComponent(user.name)}/block`, 'PUT', { isBlocked });
        user.is_blocked = updatedUser.is_blocked;
        return updatedUser.is_blocked;
      }
      return false;
    } catch (error) {
      console.error('Error toggling user block:', error);
      return false;
    }
  }

  async getAllOrders() {
    try {
      const orders = await apiRequest('/api/orders');
      this.orders = orders;
      return this.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async deleteOrder(orderId) {
    try {
      await apiRequest(`/api/orders/${orderId}`, 'DELETE');
      this.orders = this.orders.filter(o => o.id !== orderId);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async getAllWorks() {
    try {
      const works = await apiRequest('/api/works');
      this.works = works;
      return this.works;
    } catch (error) {
      console.error('Error fetching works:', error);
      return [];
    }
  }

  async deleteWork(workId) {
    try {
      await apiRequest(`/api/works/${workId}`, 'DELETE');
      this.works = this.works.filter(w => w.id !== workId);
      return true;
    } catch (error) {
      console.error('Error deleting work:', error);
      return false;
    }
  }

  async getAllReviews() {
    try {
      const reviews = await apiRequest('/api/reviews');
      this.reviews = reviews;
      return this.reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async deleteReview(reviewId) {
    try {
      await apiRequest(`/api/reviews/${reviewId}`, 'DELETE');
      this.reviews = this.reviews.filter(r => r.id !== reviewId);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }
async getAnalytics() {
  try {
    const analytics = await apiRequest('/api/analytics');
    return analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Возвращаем пустые данные или можно отобразить сообщение об ошибке в UI
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalOrders: 0,
      completedOrders: 0,
      totalWorks: 0,
      totalReviews: 0,
      popularStyles: []
    };
  }
}
}