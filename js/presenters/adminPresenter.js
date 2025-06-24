import { getCurrentUser } from '../common.js';

export class AdminPresenter {
    constructor(view, model) {
        this.view = view;
        this.model = model;
    }
    async initialize() {
        const user = getCurrentUser();
        if (!user || user.role !== 'Admin') {
            alert('Доступно только для администраторов.');
            window.location.href = 'auth.html';
            return;
        }
        this.view.setupTabs((tab) => this.switchTab(tab));
        try {
            const users = await this.model.getAllUsers();
            this.view.renderUsers(users, (userId) => this.toggleUserBlock(userId));
        } catch (error) {
            console.error('Error initializing users:', error);
            this.view.renderUsers([], (userId) => this.toggleUserBlock(userId));
        }
        try {
            const orders = await this.model.getAllOrders();
            this.view.renderOrders(orders, (orderId) => this.deleteOrder(orderId));
        } catch (error) {
            console.error('Error initializing orders:', error);
            this.view.renderOrders([], (orderId) => this.deleteOrder(orderId));
        }
        try {
            const works = await this.model.getAllWorks();
            this.view.renderWorks(works, (workId) => this.deleteWork(workId));
        } catch (error) {
            console.error('Error initializing works:', error);
            this.view.renderWorks([], (workId) => this.deleteWork(workId));
        }
        try {
            const reviews = await this.model.getAllReviews();
            this.view.renderReviews(reviews, (reviewId) => this.deleteReview(reviewId));
        } catch (error) {
            console.error('Error initializing reviews:', error);
            this.view.renderReviews([], (reviewId) => this.deleteReview(reviewId));
        }
        try {
            const analytics = await this.model.getAnalytics();
            this.view.renderAnalytics(analytics);
        } catch (error) {
            console.error('Error initializing analytics:', error);
            this.view.renderAnalytics({ totalUsers: 0, activeUsers: 0, totalOrders: 0, completedOrders: 0, totalWorks: 0, totalReviews: 0, popularStyles: [] });
        }
    }
    switchTab(tab) {
        this.view.switchTab(tab);
    }
    async toggleUserBlock(userId) {
        try {
            const isBlocked = await this.model.toggleUserBlock(userId);
            if (isBlocked !== false) {
                alert(`Пользователь ${isBlocked ? 'заблокирован' : 'разблокирован'}!`);
                const users = await this.model.getAllUsers();
                this.view.renderUsers(users, (id) => this.toggleUserBlock(id));
            } else {
                alert('Ошибка при изменении статуса пользователя.');
            }
        } catch (error) {
            console.error('Error toggling user block:', error);
            alert('Ошибка при изменении статуса пользователя.');
        }
    }
    async deleteOrder(orderId) {
        if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                if (await this.model.deleteOrder(orderId)) {
                    alert('Заказ удален!');
                    const orders = await this.model.getAllOrders();
                    this.view.renderOrders(orders, (id) => this.deleteOrder(id));
                } else {
                    alert('Ошибка при удалении заказа.');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Ошибка при удалении заказа.');
            }
        }
    }
    async deleteWork(workId) {
        if (confirm('Вы уверены, что хотите удалить эту работу?')) {
            try {
                if (await this.model.deleteWork(workId)) {
                    alert('Работа удалена!');
                    const works = await this.model.getAllWorks();
                    this.view.renderWorks(works, (id) => this.deleteWork(id));
                } else {
                    alert('Ошибка при удалении работы.');
                }
            } catch (error) {
                console.error('Error deleting work:', error);
                alert('Ошибка при удалении работы.');
            }
        }
    }
    async deleteReview(reviewId) {
        if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                if (await this.model.deleteReview(reviewId)) {
                    alert('Отзыв удален!');
                    const reviews = await this.model.getAllReviews();
                    this.view.renderReviews(reviews, (id) => this.deleteReview(id));
                } else {
                    alert('Ошибка при удалении отзыва.');
                }
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Ошибка при удалении отзыва.');
            }
        }
    }
}