import { updateNav, toggleNav, scrollToTop, setupScrollBehavior, getCurrentUser } from '../common.js';
import { ProfileModel } from '../models/profileModel.js';
import { ProfileView } from '../views/profileView.js';
import { ProfilePresenter } from '../presenters/profilePresenter.js';

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
        alert('Пожалуйста, войдите в систему, чтобы просмотреть профиль.');
        window.location.href = 'auth.html';
        return;
    }
    const presenter = new ProfilePresenter(new ProfileView(), new ProfileModel());
    await presenter.initialize();
});