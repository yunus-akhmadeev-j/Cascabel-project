import { getCurrentUser } from '../common.js';

export class OrderPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  initialize() {
    this.view.setupOrderForm(() => this.submitOrder());
  }

async submitOrder() {
  const orderData = this.view.getOrderData();
  if (!orderData || !orderData.requirements || !orderData.size || !orderData.price) {
    alert('Ошибка: данные заказа не заполнены или отсутствуют.');
    return;
  }
  try {
    const user = getCurrentUser();
    if (!user) {
      alert('Пожалуйста, войдите в систему.');
      window.location.href = 'auth.html';
      return;
    }
    const orderWithClient = { ...orderData, client: user.name };
    console.log('Submitting order with data:', JSON.stringify(orderWithClient, null, 2));
    await this.model.submitOrder(orderWithClient);
    alert('Заказ успешно отправлен!');
    this.view.clearForm();
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('Ошибка при отправке заказа. Попробуйте снова.');
  }
}}