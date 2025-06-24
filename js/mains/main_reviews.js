import { updateNav, toggleNav, scrollToTop, setupScrollBehavior } from '../common.js';
import { ReviewsModel } from '../models/reviewsModel.js';
import { ReviewsView } from '../views/reviewsView.js';
import { ReviewsPresenter } from '../presenters/reviewsPresenter.js';

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
    const presenter = new ReviewsPresenter(new ReviewsView(), new ReviewsModel());
    await presenter.initialize();
});