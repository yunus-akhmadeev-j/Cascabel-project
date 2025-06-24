export class AdminView {
    constructor() {
        this.currentTab = 'users';
    }
    renderUsers(users, onBlockUser) {
        let html = '<table><tr><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Статус</th><th>Действие</th></tr>';
        users.forEach(user => {
            html += `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td><td>${user.is_blocked ? 'Заблокирован' : 'Активен'}</td><td><button data-id="${user.id}">${user.is_blocked ? 'Разблокировать' : 'Заблокировать'}</button></td></tr>`;
        });
        html += '</table>';
        const usersList = document.getElementById('usersList');
    if (usersList) {
      usersList.innerHTML = html;
      const buttons = usersList.querySelectorAll('button[data-id]');
      buttons.forEach(button => {
        const userId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => onBlockUser(userId));
      });
    
        }
    }
    renderOrders(orders, onDeleteOrder) {
        let html = '<table><tr><th>ID</th><th>Клиент</th><th>Дизайнер</th><th>Статус</th><th>Действие</th></tr>';
        orders.forEach(order => {
            html += `<tr><td>${order.id}</td><td>${order.client}</td><td>${order.designer || 'Не назначен'}</td><td>${order.status}</td><td><button data-id="${order.id}">Удалить</button></td></tr>`;
        });
        html += '</table>';
        const ordersList = document.getElementById('ordersList');
        if (ordersList) {
            ordersList.innerHTML = html;
            const buttons = ordersList.querySelectorAll('button[data-id]');
            buttons.forEach(button => {
                const orderId = parseInt(button.getAttribute('data-id'));
                button.addEventListener('click', () => onDeleteOrder(orderId));
            });
        }
    }
    renderWorks(works, onDeleteWork) {
        let html = '<table><tr><th>ID</th><th>Название</th><th>Автор</th><th>Стиль</th><th>Действие</th></tr>';
        works.forEach(work => {
            html += `<tr><td>${work.id}</td><td>${work.title}</td><td>${work.uploader}</td><td>${work.style}</td><td><button data-id="${work.id}">Удалить</button></td></tr>`;
        });
        html += '</table>';
        const worksList = document.getElementById('worksList');
        if (worksList) {
            worksList.innerHTML = html;
            const buttons = worksList.querySelectorAll('button[data-id]');
            buttons.forEach(button => {
                const workId = parseInt(button.getAttribute('data-id'));
                button.addEventListener('click', () => onDeleteWork(workId));
            });
        }
    }
    renderReviews(reviews, onDeleteReview) {
        let html = '<table><tr><th>ID</th><th>Автор</th><th>Текст</th><th>Рейтинг</th><th>Действие</th></tr>';
        reviews.forEach(review => {
            html += `<tr><td>${review.id}</td><td>${review.author}</td><td>${review.text}</td><td>${review.rating || 'Не указан'}</td><td><button data-id="${review.id}">Удалить</button></td></tr>`;
        });
        html += '</table>';
        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            reviewsList.innerHTML = html;
            const buttons = reviewsList.querySelectorAll('button[data-id]');
            buttons.forEach(button => {
                const reviewId = parseInt(button.getAttribute('data-id'));
                button.addEventListener('click', () => onDeleteReview(reviewId));
            });
        }
    }
    renderAnalytics(analytics) {
        let html = `<h3>Общая статистика</h3>
            <p>Всего пользователей: ${analytics.totalUsers}</p>
            <p>Активных пользователей: ${analytics.activeUsers}</p>
            <p>Всего заказов: ${analytics.totalOrders}</p>
            <p>Завершенных заказов: ${analytics.completedOrders}</p>
            <p>Всего работ: ${analytics.totalWorks}</p>
            <p>Всего отзывов: ${analytics.totalReviews}</p>
            <h3>Популярные стили</h3>
            <ul>`;
        analytics.popularStyles.forEach(([style, count]) => {
            html += `<li>${style}: ${count} работ</li>`;
        });
        html += '</ul>';
        const analyticsData = document.getElementById('analyticsData');
        if (analyticsData) {
            analyticsData.innerHTML = html;
        }
    }
    setupTabs(onTabSwitch) {
        const tabButtons = document.querySelectorAll('.admin-tabs button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                onTabSwitch(tab);
            });
        });
    }
    switchTab(tab) {
        this.currentTab = tab;
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });
        const activeTab = document.getElementById(`${tab}Tab`);
        if (activeTab) {
            activeTab.style.display = 'block';
        }
    }
}