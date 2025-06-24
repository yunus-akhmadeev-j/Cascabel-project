import { updateNav, toggleNav, scrollToTop, setupScrollBehavior } from '../common.js';
import { WorksModel } from '../models/worksModel.js';
import { WorksView } from '../views/worksView.js';
import { WorksPresenter } from '../presenters/worksPresenter.js';

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
    const presenter = new WorksPresenter(new WorksView(), new WorksModel());
    presenter.initialize();
});