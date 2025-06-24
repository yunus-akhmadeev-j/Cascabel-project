import { updateNav, toggleNav, scrollToTop, setupScrollBehavior } from '../common.js';
import { AuthModel } from '../models/authModel.js';
import { AuthView } from '../views/authView.js';
import { AuthPresenter } from '../presenters/authPresenter.js';

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
    const presenter = new AuthPresenter(new AuthView(), new AuthModel());
    presenter.initialize();
});