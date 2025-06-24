import { updateNav, toggleNav, scrollToTop, setupScrollBehavior, getCurrentUser } from '../common.js';
import { OrderModel } from '../models/orderModel.js';
import { OrderView } from '../views/orderView.js';
import { OrderPresenter } from '../presenters/orderPresenter.js';

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
        alert('Пожалуйста, войдите в систему, чтобы оформить заказ.');
        window.location.href = 'auth.html';
        return;
    }
    if (user.role !== 'Client') {
        alert('Только клиенты могут оформлять заказы.');
        window.location.href = 'index.html';
        return;
    }
    const presenter = new OrderPresenter(new OrderView(), new OrderModel());
    presenter.initialize();
});