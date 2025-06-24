import { getCurrentUser } from '../common.js';

export class ReviewsPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

async initialize() {
  try {
    const reviews = await this.model.getReviews();
    this.view.renderReviews(reviews, (orderId) => this.showOrderDetails(orderId));
    const user = getCurrentUser();
    console.log('Current User:', user); // Отладка: вывод текущего пользователя
    if (user && user.role === 'Client') {
      const completedOrders = await this.model.getCompletedOrders(user.name);
      this.view.setupReviewForm(completedOrders, () => this.submitReview());
      this.view.showReviewForm();
    } else {
      this.view.hideReviewForm();
    }
  } catch (error) {
    console.error('Failed to initialize reviews:', error);
    this.view.renderReviews([], (orderId) => this.showOrderDetails(orderId));
  }
}
  async submitReview() {
    const user = getCurrentUser();
    const data = this.view.getReviewData();
    if (data.text && data.orderId && data.rating > 0 && user) {
      try {
        const newReview = {
          id: (await this.model.getReviews()).length + 1,
          author: user.name,
          text: data.text,
          date: new Date().toISOString().split('T')[0],
          avatar: user.avatar || 'https://via.placeholder.com/100',
          orderId: data.orderId,
          rating: data.rating,
          target: data.target || ''
        };
        await this.model.addReview(newReview);
        const reviews = await this.model.getReviews();
        this.view.renderReviews(reviews, (orderId) => this.showOrderDetails(orderId));
        this.view.clearReviewForm();
        alert('Отзыв успешно отправлен!');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Ошибка при отправке отзыва. Попробуйте снова.');
      }
    } else {
      alert('Пожалуйста, заполните все поля, выберите заказ и установите рейтинг.');
    }
  }
  showOrderDetails(orderId) {
    // Предполагается, что заказы должны быть получены из модели
    alert(`Детали заказа #${orderId}: Информация о заказе недоступна (заглушка).`);
  }
}