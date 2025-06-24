import { updateNav, toggleNav, scrollToTop, setupScrollBehavior, getCurrentUser } from '../common.js';
import { AdminModel } from '../models/adminModel.js';
import { AdminView } from '../views/adminView.js';
import { AdminPresenter } from '../presenters/adminPresenter.js';

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
        alert('Пожалуйста, войдите в систему, чтобы получить доступ к админ-панели.');
        window.location.href = 'auth.html';
        return;
    }
    if (user.role !== 'Admin') {
        alert('Доступно только для администраторов.');
        window.location.href = 'index.html';
        return;
    }
    const presenter = new AdminPresenter(new AdminView(), new AdminModel());
    await presenter.initialize();
});