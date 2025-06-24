export class HomeModel {
  async getStyles() {
    try {
      const response = await fetch('http://localhost:3000/api/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching styles:', error);
      throw error;
    }
  }

  async getServices() {
    try {
      const response = await fetch('http://localhost:3000/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getDesigners() {
    try {
      const response = await fetch('http://localhost:3000/api/users?role=Designer');
      if (!response.ok) {
        throw new Error('Failed to fetch designers');
      }
      const users = await response.json();
      return users.sort((a, b) => (b.level || 0) - (a.level || 0));
    } catch (error) {
      console.error('Error fetching designers:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order with ID ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching order by ID ${id}:`, error);
      throw error;
    }
  }

  async getRecentCompletedOrders() {
    try {
      const response = await fetch('http://localhost:3000/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const orders = await response.json();
      return orders
        .filter(order => order.status === 'Completed')
        .slice(-5)
        .reverse();
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  async getTopUsers() {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      return users
        .filter(user => user.name !== 'Admin')
        .sort((a, b) => (b.level || 0) - (a.level || 0));
    } catch (error) {
      console.error('Error fetching top users:', error);
      throw error;
    }
  }

  async getDesignerById(id) {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch designer with ID ${id}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching designer by ID ${id}:`, error);
      throw error;
    }
  }
}