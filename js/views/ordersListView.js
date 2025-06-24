export class OrdersListView {
  constructor() {
    this.currentTab = 'open';
    this.currentPage = 1;
    this.itemsPerPage = 10;
  }

  renderOpenOrders(orders, onTakeOrder) {
    let html = '<h2>Открытые заказы</h2><table><tr><th>Клиент</th><th>Требования</th><th>Размер</th><th>Цена</th><th>Действие</th></tr>';
    // Проверка, что orders — это массив
    const openOrders = Array.isArray(orders) ? orders : [];
    if (openOrders.length === 0) {
      html += '<tr><td colspan="5">Нет открытых заказов</td></tr>';
    } else {
      openOrders.forEach(order => {
        html += `<tr><td>${order.client}</td><td>${order.requirements}</td><td>${order.size}</td><td>${order.price}</td><td><button data-id="${order.id}">Взять заказ</button></td></tr>`;
      });
    }
    html += '</table>';
    const openOrdersList = document.getElementById('openOrdersList');
    if (openOrdersList) {
      openOrdersList.innerHTML = html;
      const buttons = openOrdersList.querySelectorAll('button[data-id]');
      buttons.forEach(button => {
        const orderId = parseInt(button.getAttribute('data-id'));
        button.addEventListener('click', () => onTakeOrder(orderId));
      });
    }
  }

  renderCurrentOrders(orders) {
  const container = document.getElementById('currentOrdersList'); // Исправляем ID на currentOrdersList
  if (!container) return;
  container.innerHTML = '';
  let html = '<h2>Текущие заказы</h2><table><tr><th>Клиент</th><th>Требования</th><th>Размер</th><th>Цена</th><th>Статус</th></tr>';
  // Проверяем, является ли orders массивом
  if (Array.isArray(orders) && orders.length > 0) {
    orders.forEach(order => {
      html += `<tr><td>${order.client}</td><td>${order.requirements}</td><td>${order.size}</td><td>${order.price}</td><td>${order.status}</td></tr>`;
    });
  } else {
    html += '<tr><td colspan="5">Нет текущих заказов</td></tr>';
  }
  html += '</table>';
  container.innerHTML = html;
}

  renderHistoryOrders(orders, currentPage, onPageChange) {
    this.currentPage = currentPage;
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);
    let html = '<table><tr><th>Клиент</th><th>Требования</th><th>Размер</th><th>Цена</th><th>Дизайнер</th><th>Дата завершения</th></tr>';
    paginatedOrders.forEach(order => {
        html += `<tr><td>${order.client}</td><td>${order.requirements}</td><td>${order.size}</td><td>${order.price}</td><td>${order.designer || 'Не назначен'}</td><td>${order.completedAt || 'Не указано'}</td></tr>`;
    });
    html += '</table>';
    const historyOrdersList = document.getElementById('historyOrdersList');
    if (historyOrdersList) {
        historyOrdersList.innerHTML = html;
    }
    this.renderPagination(orders.length, onPageChange);
  }

  renderPagination(totalItems, onPageChange) {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button data-page="${i}" class="${i === this.currentPage ? 'active' : ''}">${i}</button>`;
    }
    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.innerHTML = html;
        const buttons = pagination.querySelectorAll('button[data-page]');
        buttons.forEach(button => {
            const page = parseInt(button.getAttribute('data-page'));
            button.addEventListener('click', () => onPageChange(page));
        });
    }
  }

  setupTabs(onTabSwitch) {
    const tabButtons = document.querySelectorAll('.orders-tabs button');
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