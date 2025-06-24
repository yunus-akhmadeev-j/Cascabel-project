import { updateNav, toggleNav, scrollToTop, setupScrollBehavior } from '../common.js';
import { HomeModel } from '../models/homeModel.js';
import { HomeView } from '../views/homeView.js';
import { HomePresenter } from '../presenters/homePresenter.js';

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
    const presenter = new HomePresenter(new HomeView(), new HomeModel());
    await presenter.initialize();
});