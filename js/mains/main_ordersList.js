import { updateNav, toggleNav, scrollToTop, setupScrollBehavior, getCurrentUser } from '../common.js';
import { OrdersListModel } from '../models/ordersListModel.js';
import { OrdersListView } from '../views/ordersListView.js';
import { OrdersListPresenter } from '../presenters/ordersListPresenter.js';

document.addEventListener('DOMContentLoaded', async () => {
    updateNav();
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleNav);
    }
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }
    setupScrollBehavior();
    const user = getCurrentUser();
    if (!user) {
        alert('Пожалуйста, войдите в систему, чтобы просмотреть список заказов.');
        window.location.href = 'auth.html';
        return;
    }
    if (user.role !== 'Designer') {
        alert('Только дизайнеры могут просматривать список заказов.');
        window.location.href = 'index.html';
        return;
    }
    const presenter = new OrdersListPresenter(new OrdersListView(), new OrdersListModel());
    await presenter.initialize();
});