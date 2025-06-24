import { apiRequest } from '../common.js';

export class ProfileModel {
  constructor() {}

  async getUserProfile(username) {
    try {
      const user = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async getActiveOrders(username) {
    try {
      const user = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      const orderIds = user.current_orders || [];
      if (orderIds.length === 0) return [];
      const orders = await Promise.all(orderIds.map(async id => {
        try {
          return await apiRequest(`/api/orders/${id}`);
        } catch (e) {
          return null;
        }
      }));
      return orders.filter(order => order !== null);
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  }

  async getCompletedOrders(username) {
    try {
      const user = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      const orderIds = user.completed_orders || [];
      if (orderIds.length === 0) return [];
      const orders = await Promise.all(orderIds.map(async id => {
        try {
          return await apiRequest(`/api/orders/${id}`);
        } catch (e) {
          return null;
        }
      }));
      return orders.filter(order => order !== null);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  }

  async updateUserProfile(username, newPassword, newEmail, newAvatar) {
    try {
      const updateData = {};
      if (newPassword) updateData.password = newPassword;
      if (newEmail) updateData.email = newEmail;
      if (newAvatar) updateData.avatar = newAvatar;
      await apiRequest(`/api/users/${encodeURIComponent(username)}`, 'PUT', updateData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const order = await apiRequest(`/api/orders/${id}`);
      return order;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error;
    }
  }

  async getUserStats(username) {
    try {
      const stats = await apiRequest(`/api/analytics/user/${encodeURIComponent(username)}`);
      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async updateUserExp(username, expAmount) {
    try {
      const updatedUser = await apiRequest(`/api/users/${encodeURIComponent(username)}/experience`, 'PUT', { exp: expAmount });
      if (updatedUser.level > (getCurrentUser().level || 1)) {
        return updatedUser.level;
      }
      return false;
    } catch (error) {
      console.error('Error updating user exp:', error);
      throw error;
    }
  }

  async confirmOrderByDesigner(orderId) {
    try {
      await apiRequest(`/api/orders/${orderId}/confirm-designer`, 'PUT');
      return true;
    } catch (error) {
      console.error('Error confirming order by designer:', error);
      return false;
    }
  }

  async confirmOrderByClient(orderId) {
    try {
      await apiRequest(`/api/orders/${orderId}/confirm-client`, 'PUT');
      return true;
    } catch (error) {
      console.error('Error confirming order by client:', error);
      return false;
    }
  }

  async addAchievement(username, achievementId, level) {
    try {
      await apiRequest(`/api/users/${encodeURIComponent(username)}/achievements`, 'PUT', { achievementId, level });
      return true;
    } catch (error) {
      console.error('Error adding achievement:', error);
      return false;
    }
  }

  async addCoins(username, amount) {
    try {
      await apiRequest(`/api/users/${encodeURIComponent(username)}/coins`, 'PUT', { amount });
      return true;
    } catch (error) {
      console.error('Error adding coins:', error);
      return false;
    }
  }
    async getUserCoins(username) {
    try {
      const userData = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      return userData.coins || 0; // Возвращаем количество монет или 0, если поле отсутствует
    } catch (error) {
      console.error('Error fetching user coins:', error);
      return 0; // Возвращаем 0 в случае ошибки
    }
  }

  async purchasePremiumFeature(username, feature, cost) {
    try {
      await apiRequest(`/api/users/${encodeURIComponent(username)}/premium`, 'PUT', { feature, cost });
      return true;
    } catch (error) {
      console.error('Error purchasing premium feature:', error);
      return false;
    }
  }
async getUserPremiumFeatures(username) {
  try {
    const userData = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
    return userData.premiumFeatures || []; // Возвращаем список премиум-функций или пустой массив
  } catch (error) {
    console.error('Error fetching user premium features:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}
  // Вспомогательные методы
  getExpByRank(rank) {
    switch (rank) {
      case 'Bronze': return 10;
      case 'Silver': return 20;
      case 'Gold': return 30;
      case 'Platinum': return 50;
      default: return 10;
    }
  }
}