import { getCurrentUser } from '../common.js';

export class OrdersListPresenter {
    constructor(view, model) {
        this.view = view;
        this.model = model;
        this.currentTab = 'open';
        this.currentPage = 1;
    }
    async initialize() {
        const user = getCurrentUser();
        if (!user || user.role !== 'Designer') {
            alert('Доступно только для дизайнеров.');
            window.location.href = 'auth.html';
        } else {
            this.view.setupTabs((tab) => this.switchTab(tab));
            try {
                const openOrders = await this.model.getOpenOrders();
                this.view.renderOpenOrders(openOrders, (orderId) => this.takeOrder(orderId));
            } catch (error) {
                console.error('Error fetching open orders:', error);
                this.view.renderOpenOrders([], (orderId) => this.takeOrder(orderId));
            }
            try {
                const currentOrders = await this.model.getAllTakenOrders();
                this.view.renderCurrentOrders(currentOrders);
            } catch (error) {
                console.error('Error fetching current orders:', error);
                this.view.renderCurrentOrders([]);
            }
            try {
                const historyOrders = await this.model.getAllCompletedOrders();
                this.view.renderHistoryOrders(historyOrders, this.currentPage, (page) => this.changePage(page));
            } catch (error) {
                console.error('Error fetching history orders:', error);
                this.view.renderHistoryOrders([], this.currentPage, (page) => this.changePage(page));
            }
        }
    }
    switchTab(tab) {
        this.currentTab = tab;
        this.view.switchTab(tab);
    }
    async takeOrder(orderId) {
        const user = getCurrentUser();
        try {
            await this.model.takeOrder(orderId, user.name);
            alert('Заказ успешно принят!');
            const openOrders = await this.model.getOpenOrders();
            this.view.renderOpenOrders(openOrders, (id) => this.takeOrder(id));
            const currentOrders = await this.model.getAllTakenOrders();
            this.view.renderCurrentOrders(currentOrders);
        } catch (error) {
            console.error('Error taking order:', error);
            alert('Ошибка при взятии заказа.');
        }
    }
    async changePage(page) {
        this.currentPage = page;
        try {
            const historyOrders = await this.model.getAllCompletedOrders();
            this.view.renderHistoryOrders(historyOrders, this.currentPage, (p) => this.changePage(p));
        } catch (error) {
            console.error('Error changing page:', error);
            this.view.renderHistoryOrders([], this.currentPage, (p) => this.changePage(p));
        }
    }
}