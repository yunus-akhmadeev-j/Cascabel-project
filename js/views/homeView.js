export class HomeView {
    constructor() {
        this.userCard = null;
        this.modal = document.getElementById('orderModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.fullUsersModal = document.getElementById('fullUsersListModal');
        this.closeFullUsersBtn = document.getElementById('closeFullUsersList');
        this.itemsPerPage = 10;
        this.currentPage = 1;
        this.fullscreenCarousel = null;
    }
    renderStyles(styles, onCardClick) {
        if (!Array.isArray(styles)) {
            console.error('Styles is not an array:', styles);
            const stylesCards = document.getElementById('stylesCards');
            if (stylesCards) {
                stylesCards.innerHTML = '<p>Ошибка загрузки стилей.</p>';
            }
            return;
        }

        let html = '';
        styles.forEach((style, index) => {
            html += `<div class="card ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${style.image}" alt="${style.name}">
                <h3>${style.name}</h3>
                <p>${style.description}</p>
            </div>`;
        });
        
        const stylesCards = document.getElementById('stylesCards');
        if (stylesCards) {
            stylesCards.innerHTML = html;
            const cards = stylesCards.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.addEventListener('click', () => onCardClick(index));
            });
        }
    }
    renderServices(services) {
        if (!Array.isArray(services)) {
            console.error('Services is not an array:', services);
            const servicesList = document.getElementById('servicesList');
            if (servicesList) {
                servicesList.innerHTML = '<p>Ошибка загрузки услуг.</p>';
            }
            return;
        }

        let html = '<ul>';
        services.forEach(service => {
            html += `<li>${service.type}<ul>`;
            if (service.sub_services && Array.isArray(service.sub_services)) {
                service.sub_services.forEach(sub => {
                    html += `<li>${sub}</li>`;
                });
            }
            html += `</ul></li>`;
        });
        html += '</ul>';
        const servicesList = document.getElementById('servicesList');
        if (servicesList) {
            servicesList.innerHTML = html;
        }
    }
    renderDesigners(designers, onDesignerClick) {
        if (!Array.isArray(designers)) {
            console.error('Designers is not an array:', designers);
            const tbody = document.querySelector('#topDesignersTable tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки дизайнеров.</td></tr>';
            }
            return;
        }

        let html = '';
        designers.slice(0, 10).forEach((designer, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td data-id="${designer.id}" style="cursor: pointer; color: #DAA520; text-decoration: underline;">${designer.name}</td>
                <td>${designer.rank}</td>
                <td>${designer.level}</td>
            </tr>`;
        });
        const tbody = document.querySelector('#topDesignersTable tbody');
        if (tbody) {
            tbody.innerHTML = html;
            const nameCells = tbody.querySelectorAll('td[data-id]');
            nameCells.forEach(cell => {
                const designerId = parseInt(cell.getAttribute('data-id'));
                cell.addEventListener('click', () => onDesignerClick(designerId));
            });
        }
    }
    renderTopUsers(users, onShowFullList) {
        if (!Array.isArray(users)) {
            console.error('Top users is not an array:', users);
            const topUsersSidebar = document.getElementById('topUsersSidebar');
            if (topUsersSidebar) {
                topUsersSidebar.innerHTML = '<p>Ошибка загрузки пользователей.</p>';
            }
            return;
        }

        let html = '';
        users.slice(0, 5).forEach((user, index) => {
            const rank = index + 1;
            const className = rank === 1 ? 'top-1' : rank === 2 ? 'top-2' : rank === 3 ? 'top-3' : '';
            html += `<div class="top-user ${className}" data-rank="${rank}">
                <span>${user.name} (Уровень: ${user.level})</span>
            </div>`;
        });
        const topUsersSidebar = document.getElementById('topUsersSidebar');
        if (topUsersSidebar) {
            topUsersSidebar.innerHTML = html;
        }
        const showFullListBtn = document.getElementById('showFullUsersList');
        if (showFullListBtn) {
            showFullListBtn.addEventListener('click', onShowFullList);
        }
    }

    renderFullUsersList(users, currentPage, onPageChange, onClose) {
        this.currentPage = currentPage;
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);
        let html = '';
        paginatedUsers.forEach((user, index) => {
            const globalIndex = startIndex + index + 1;
            html += `<tr>
                <td>${globalIndex}</td>
                <td>${user.name}</td>
                <td>${user.level}</td>
            </tr>`;
        });
        const tbody = document.querySelector('#fullUsersListTable tbody');
        if (tbody) {
            tbody.innerHTML = html;
        }
        this.renderPagination(users.length, onPageChange);
        if (this.fullUsersModal) {
            this.fullUsersModal.style.display = 'block';
        }
        if (this.closeFullUsersBtn) {
            this.closeFullUsersBtn.addEventListener('click', onClose);
        }
    }
    renderPagination(totalItems, onPageChange) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button data-page="${i}" class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
        }
        const pagination = document.getElementById('paginationFullUsers');
        if (pagination) {
            pagination.innerHTML = html;
            const buttons = pagination.querySelectorAll('button[data-page]');
            buttons.forEach(button => {
                const page = parseInt(button.getAttribute('data-page'));
                button.addEventListener('click', () => onPageChange(page));
            });
        }
    }
    closeFullUsersList() {
        if (this.fullUsersModal) {
            this.fullUsersModal.style.display = 'none';
        }
    }
    renderRecentOrders(orders, onDetailsClick) {
        if (!Array.isArray(orders)) {
            console.error('Orders is not an array:', orders);
            const recentOrdersList = document.getElementById('recentOrdersList');
            if (recentOrdersList) {
                recentOrdersList.innerHTML = '<p>Ошибка загрузки заказов.</p>';
            }
            return;
        }

        let html = '';
        if (orders.length === 0) {
            html = '<p>Нет выполненных заказов.</p>';
        } else {
            html = '<table><tr><th>Клиент</th><th>Требования</th><th>Дизайнер</th><th>Подробности</th></tr>';
            orders.forEach(order => {
                html += `<tr><td>${order.client}</td><td>${order.requirements}</td><td>${order.designer || 'Не назначен'}</td><td><span data-id="${order.id}" style="cursor: pointer; color: #DAA520;">→</span></td></tr>`;
            });
            html += '</table>';
        }
        const recentOrdersList = document.getElementById('recentOrdersList');
        if (recentOrdersList) {
            recentOrdersList.innerHTML = html;
            const detailLinks = recentOrdersList.querySelectorAll('span[data-id]');
            detailLinks.forEach(link => {
                const orderId = parseInt(link.getAttribute('data-id'));
                link.addEventListener('click', () => onDetailsClick(orderId));
            });
        }
    }
    renderInteriorStyles(styles) {
        let html = '';
        styles.forEach(style => {
            html += `<div class="grid-item">
                <img src="${style.image}" alt="${style.name}">
                <h3>${style.name}</h3>
                <p>${style.description}</p>
            </div>`;
        });
        const stylesDescription = document.getElementById('stylesDescription');
        if (stylesDescription) {
            stylesDescription.innerHTML = html;
        }
    }
    activateCard(index) {
        const cards = document.querySelectorAll('.card');
        if (cards.length > index) {
            cards.forEach(card => card.classList.remove('active'));
            cards[index].classList.add('active');
        }
    }
    showDesignerCard(designer) {
        if (this.userCard) {
            this.userCard.remove();
        }
        this.userCard = document.createElement('div');
        this.userCard.className = 'user-card';
        this.userCard.innerHTML = `<img src="${designer.avatar}" alt="${designer.name}">
            <h3>${designer.name}</h3>
            <p>Ранг: ${designer.rank}</p>
            <p>Уровень: ${designer.level}</p>
            <button>Закрыть</button>`;
        document.body.appendChild(this.userCard);
        this.userCard.style.display = 'block';
        const closeBtn = this.userCard.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.userCard.style.display = 'none';
            });
        }
    }
    showOrderDetails(order) {
        const orderDetails = document.getElementById('orderDetails');
        if (orderDetails) {
            orderDetails.innerHTML = `<p><strong>Клиент:</strong> ${order.client}</p>
                <p><strong>Дизайнер:</strong> ${order.designer || 'Не назначен'}</p>
                <p><strong>Требования:</strong> ${order.requirements}</p>
                <p><strong>Размер:</strong> ${order.size} кв.м</p>
                <p><strong>Цена:</strong> ${order.price} руб</p>
                <p><strong>Дата создания:</strong> ${order.createdAt || 'Не указано'}</p>
                <p><strong>Дата принятия:</strong> ${order.takenAt || 'Не указано'}</p>
                <p><strong>Дата завершения:</strong> ${order.completedAt || 'Не указано'}</p>
                <p><strong>Статус:</strong> ${order.status}</p>
                <h3>Фотографии работ:</h3>
                <img src="https://via.placeholder.com/100" alt="Фото 1">
                <img src="https://via.placeholder.com/100" alt="Фото 2">
                <img src="https://via.placeholder.com/100" alt="Фото 3">`;
        }
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
    }
    showFullscreenImage(src, alt) {
        if (this.fullscreenCarousel) {
            this.fullscreenCarousel.remove();
        }
        this.fullscreenCarousel = document.createElement('div');
        this.fullscreenCarousel.className = 'carousel-fullscreen';
        this.fullscreenCarousel.innerHTML = `<img src="${src}" alt="${alt}">
          <button style="position: absolute; top: 20px; right: 20px; background: #800000; color: #FFF8DC; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Закрыть</button>`;
        document.body.appendChild(this.fullscreenCarousel);
        this.fullscreenCarousel.style.display = 'flex';
        const closeBtn = this.fullscreenCarousel.querySelector('button');
        closeBtn.addEventListener('click', () => {
            this.fullscreenCarousel.style.display = 'none';
            this.fullscreenCarousel.remove();
            this.fullscreenCarousel = null;
        });
        // Закрытие по клику на фон
        this.fullscreenCarousel.addEventListener('click', (e) => {
            if (e.target === this.fullscreenCarousel) {
                this.fullscreenCarousel.style.display = 'none';
                this.fullscreenCarousel.remove();
                this.fullscreenCarousel = null;
            }
        });
    }
}