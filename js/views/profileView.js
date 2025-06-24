import { getCurrentUser } from '../common.js';

export class ProfileView {
  constructor() {
    this.showCompleted = false;
    this.showMailSection = 'inbox'; // По умолчанию выбран раздел "Входящие"
    this.isInboxVisible = false; // Флаг видимости списка входящих
    this.isSentVisible = false; // Флаг видимости списка отправленных
    this.currentInboxPage = 1; // Текущая страница для входящих
    this.currentSentPage = 1; // Текущая страница для отправленных
    this.messagesPerPage = 10; // Количество сообщений на странице
    this.modal = document.getElementById('orderModal');
    this.closeModalBtn = document.getElementById('closeModal');
    this.messageModal = document.getElementById('messageModal');
    this.closeMessageModalBtn = document.getElementById('closeMessageModal');
    this.currentTab = 'inbox'; // По умолчанию активна вкладка "Входящие"
    this.isMailRendered = false; // Флаг для предотвращения повторного рендеринга
    this.lastRenderState = { inboxVisible: false, sentVisible: false }; // Для отслеживания последнего состояния
  }

  renderProfile(user) {
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
      profileInfo.innerHTML = `
        <h2>Профиль пользователя</h2>
        <img src="${user.avatar || './assets/default-avatar.png'}" alt="${user.name}" style='max-width: 250px;'>
        <p><strong>Имя:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email || 'Не указан'}</p>
        <p><strong>Роль:</strong> ${user.role}</p>
      `;
    }
  }

  renderOrders(orders, onConfirmDesigner, onConfirmClient, onDetailsClick) {
    let html = '<h2>Ваши текущие заказы</h2><table><tr><th>Требования</th><th>Размер</th><th>Цена</th><th>Статус</th><th>Действие</th><th>Подробности</th></tr>';
    const activeOrders = Array.isArray(orders) ? orders.filter(order => order.status !== 'Completed') : [];
    if (activeOrders.length === 0) {
      html += '<tr><td colspan="6">Нет активных заказов</td></tr>';
    } else {
      activeOrders.forEach(order => {
        let action = '';
        if (order.designer && order.status === 'In Progress' && order.designer === getCurrentUser().name) {
          action = `<button data-id="${order.id}" class="confirm-designer">Подтвердить выполнение</button>`;
        } else if (order.designer && order.status === 'Under Review' && order.designer === getCurrentUser().name) {
          action = `<button data-id="${order.id}" class="confirm-designer" disabled>Ожидает подтверждения</button>`;
        } else if (order.status === 'Under Review' && order.client === getCurrentUser().name) {
          action = `<button data-id="${order.id}" class="confirm-client">Подтвердить завершение</button>`;
        }
        html += `<tr><td>${order.requirements}</td><td>${order.size}</td><td>${order.price}</td><td>${order.status}</td><td>${action}</td><td><span data-id="${order.id}" style="cursor: pointer; color: #ffd700;">→</span></td></tr>`;
      });
    }
    html += '</table>';
    const profileOrders = document.getElementById('profileOrders');
    if (profileOrders) {
      profileOrders.innerHTML = html;
      const designerButtons = profileOrders.querySelectorAll('button.confirm-designer:not(:disabled)');
      designerButtons.forEach(btn => {
        const orderId = parseInt(btn.getAttribute('data-id'));
        btn.addEventListener('click', () => onConfirmDesigner(orderId));
      });
      const clientButtons = profileOrders.querySelectorAll('button.confirm-client');
      clientButtons.forEach(btn => {
        const orderId = parseInt(btn.getAttribute('data-id'));
        btn.addEventListener('click', () => onConfirmClient(orderId));
      });
      const detailLinks = profileOrders.querySelectorAll('span[data-id]');
      detailLinks.forEach(link => {
        const orderId = parseInt(link.getAttribute('data-id'));
        link.addEventListener('click', () => onDetailsClick(orderId));
      });
    }
  }

  renderCompletedOrders(orders, onDetailsClick) {
    const completedOrders = document.getElementById('completedOrders');
    const toggleBtn = document.getElementById('toggleCompleted');
    if (completedOrders && toggleBtn) {
      if (this.showCompleted) {
        let html = '<h2>Выполненные заказы</h2><table><tr><th>Требования</th><th>Размер</th><th>Цена</th><th>Подробности</th></tr>';
        const completed = Array.isArray(orders) ? orders.filter(order => order.status === 'Completed') : [];
        if (completed.length === 0) {
          html += '<tr><td colspan="4">Нет выполненных заказов</td></tr>';
        } else {
          completed.forEach(order => {
            html += `<tr><td>${order.requirements}</td><td>${order.size}</td><td>${order.price}</td><td><span data-id="${order.id}" style="cursor: pointer; color: #ffd700;">→</span></td></tr>`;
          });
        }
        html += '</table>';
        completedOrders.innerHTML = html;
        completedOrders.style.display = 'block';
        toggleBtn.textContent = 'Скрыть выполненные заказы';
        const detailLinks = completedOrders.querySelectorAll('span[data-id]');
        detailLinks.forEach(link => {
          const orderId = parseInt(link.getAttribute('data-id'));
          link.addEventListener('click', () => onDetailsClick(orderId));
        });
      } else {
        completedOrders.style.display = 'none';
        toggleBtn.textContent = 'Показать выполненные заказы';
      }
    }
  }

  renderMail(inbox, sent, onSendMail, onMarkRead, onShowInbox, onShowSent, onMessageClick) {
    // Проверяем, был ли уже выполнен рендеринг для текущего состояния
    if (this.isMailRendered && 
        this.lastRenderState.inboxVisible === this.isInboxVisible && 
        this.lastRenderState.sentVisible === this.isSentVisible) {
      console.log('Mail already rendered for current state, skipping...');
      return;
    }
    this.isMailRendered = true;
    this.lastRenderState = { inboxVisible: this.isInboxVisible, sentVisible: this.isSentVisible };

    const mailListInbox = document.getElementById('mailListInbox');
    const mailListSent = document.getElementById('mailListSent');
    const showInboxBtn = document.getElementById('showInbox');
    const showSentBtn = document.getElementById('showSent');
    const mailPaginationInbox = document.getElementById('mailPaginationInbox');
    const mailPaginationSent = document.getElementById('mailPaginationSent');

    console.log('Rendering mail: Inbox visible:', this.isInboxVisible, 'Sent visible:', this.isSentVisible);

    // Рендерим входящие сообщения
    if (mailListInbox && mailPaginationInbox) {
      if (this.isInboxVisible) {
        const totalInboxPages = Math.ceil(inbox.length / this.messagesPerPage);
        const startIndex = (this.currentInboxPage - 1) * this.messagesPerPage;
        const endIndex = startIndex + this.messagesPerPage;
        const paginatedInbox = inbox.slice(startIndex, endIndex);

        let inboxHtml = '<div class="mail-container"><h3>Входящие сообщения</h3>';
        if (inbox.length === 0) {
          inboxHtml += '<p>Нет сообщений</p>';
        } else {
          paginatedInbox.forEach(mail => {
            const sender = mail.from_user || mail.from || 'Неизвестный отправитель';
            inboxHtml += `<div class="mail-item ${mail.read ? '' : 'unread'}" data-id="${mail.id}">
              <p><strong>От:</strong> ${sender}</p>
              <p><strong>Тема:</strong> ${mail.subject}</p>
            </div>`;
          });
        }
        inboxHtml += '</div>';
        mailListInbox.innerHTML = inboxHtml;
        mailListInbox.style.display = 'block';

        // Добавляем пагинацию для входящих
        let paginationHtml = '<div class="pagination">';
        paginationHtml += `<button onclick="window.profileView.prevInboxPage()" ${this.currentInboxPage === 1 ? 'disabled' : ''}>Назад</button>`;
        paginationHtml += `<span>Страница ${this.currentInboxPage} из ${totalInboxPages || 1}</span>`;
        paginationHtml += `<button onclick="window.profileView.nextInboxPage()" ${this.currentInboxPage === totalInboxPages ? 'disabled' : ''}>Вперед</button>`;
        paginationHtml += '</div>';
        mailPaginationInbox.innerHTML = paginationHtml;
        mailPaginationInbox.style.display = inbox.length > this.messagesPerPage ? 'flex' : 'none';

        // Добавляем обработчики для открытия сообщения
        const mailItems = mailListInbox.querySelectorAll('.mail-item');
        mailItems.forEach(item => {
          const mailId = parseInt(item.getAttribute('data-id'));
          item.onclick = null; // Удаляем старый обработчик
          item.addEventListener('click', () => onMessageClick(mailId, 'inbox'), { once: true });
        });
      } else {
        mailListInbox.style.display = 'none';
        mailPaginationInbox.style.display = 'none';
      }
    }

    // Рендерим отправленные сообщения
    if (mailListSent && mailPaginationSent) {
      if (this.isSentVisible) {
        const totalSentPages = Math.ceil(sent.length / this.messagesPerPage);
        const startIndex = (this.currentSentPage - 1) * this.messagesPerPage;
        const endIndex = startIndex + this.messagesPerPage;
        const paginatedSent = sent.slice(startIndex, endIndex);

        let sentHtml = '<div class="mail-container"><h3>Отправленные сообщения</h3>';
        if (sent.length === 0) {
          sentHtml += '<p>Нет сообщений</p>';
        } else {
          paginatedSent.forEach(mail => {
            const recipient = mail.to_user || mail.to || 'Неизвестный получатель';
            sentHtml += `<div class="mail-item" data-id="${mail.id}">
              <p><strong>Кому:</strong> ${recipient}</p>
              <p><strong>Тема:</strong> ${mail.subject}</p>
            </div>`;
          });
        }
        sentHtml += '</div>';
        mailListSent.innerHTML = sentHtml;
        mailListSent.style.display = 'block';

        // Добавляем пагинацию для отправленных
        let paginationHtml = '<div class="pagination">';
        paginationHtml += `<button onclick="window.profileView.prevSentPage()" ${this.currentSentPage === 1 ? 'disabled' : ''}>Назад</button>`;
        paginationHtml += `<span>Страница ${this.currentSentPage} из ${totalSentPages || 1}</span>`;
        paginationHtml += `<button onclick="window.profileView.nextSentPage()" ${this.currentSentPage === totalSentPages ? 'disabled' : ''}>Вперед</button>`;
        paginationHtml += '</div>';
        mailPaginationSent.innerHTML = paginationHtml;
        mailPaginationSent.style.display = sent.length > this.messagesPerPage ? 'flex' : 'none';

        // Добавляем обработчики для открытия сообщения
        const mailItems = mailListSent.querySelectorAll('.mail-item');
        mailItems.forEach(item => {
          const mailId = parseInt(item.getAttribute('data-id'));
          item.onclick = null; // Удаляем старый обработчик
          item.addEventListener('click', () => onMessageClick(mailId, 'sent'), { once: true });
        });
      } else {
        mailListSent.style.display = 'none';
        mailPaginationSent.style.display = 'none';
      }
    }

    // Обновляем активные кнопки и добавляем обработчики событий
    if (showInboxBtn && showSentBtn) {
      // Удаляем старые обработчики, чтобы избежать дублирования
      const oldInboxHandler = showInboxBtn.onclick;
      const oldSentHandler = showSentBtn.onclick;
      if (oldInboxHandler) showInboxBtn.removeEventListener('click', onShowInbox);
      if (oldSentHandler) showSentBtn.removeEventListener('click', onShowSent);
      // Добавляем новые обработчики
      showInboxBtn.addEventListener('click', onShowInbox);
      showSentBtn.addEventListener('click', onShowSent);

      if (this.showMailSection === 'inbox') {
        showInboxBtn.classList.add('active');
        showSentBtn.classList.remove('active');
      } else {
        showInboxBtn.classList.remove('active');
        showSentBtn.classList.add('active');
      }
    }

    // Обработчик для кнопки отправки
    const sendMailBtn = document.querySelector('#sendMailForm button');
    if (sendMailBtn) {
      sendMailBtn.onclick = null;
      sendMailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        onSendMail();
      });
    }

    // Обработчик для закрытия модального окна сообщения
    if (this.closeMessageModalBtn) {
      this.closeMessageModalBtn.onclick = null;
      this.closeMessageModalBtn.addEventListener('click', () => {
        if (this.messageModal) {
          this.messageModal.style.display = 'none';
        }
      });
    }
  }

  // Методы для пагинации входящих сообщений
  prevInboxPage() {
    if (this.currentInboxPage > 1) {
      this.currentInboxPage--;
      this.isMailRendered = false; // Сбрасываем флаг для повторного рендеринга
      window.profilePresenter.renderMailSection();
    }
  }

  nextInboxPage() {
    this.currentInboxPage++;
    this.isMailRendered = false; // Сбрасываем флаг для повторного рендеринга
    window.profilePresenter.renderMailSection();
  }

  // Методы для пагинации отправленных сообщений
  prevSentPage() {
    if (this.currentSentPage > 1) {
      this.currentSentPage--;
      this.isMailRendered = false; // Сбрасываем флаг для повторного рендеринга
      window.profilePresenter.renderMailSection();
    }
  }

  nextSentPage() {
    this.currentSentPage++;
    this.isMailRendered = false; // Сбрасываем флаг для повторного рендеринга
    window.profilePresenter.renderMailSection();
  }

  // Метод для отображения содержимого сообщения в модальном окне
  showMessageDetails(mail, type) {
    const messageDetails = document.getElementById('messageDetails');
    if (messageDetails) {
      const senderOrRecipient = type === 'inbox'
        ? `<p><strong>От:</strong> ${mail.from_user || mail.from || 'Неизвестный отправитель'}</p>`
        : `<p><strong>Кому:</strong> ${mail.to_user || mail.to || 'Неизвестный получатель'}</p>`;
      messageDetails.innerHTML = `
        ${senderOrRecipient}
        <p><strong>Тема:</strong> ${mail.subject}</p>
        <p><strong>Дата:</strong> ${mail.date}</p>
        <p>${mail.content}</p>
      `;
    }
    if (this.messageModal) {
      this.messageModal.style.display = 'flex';
    }
  }

  getMailData() {
    const to = document.getElementById('mailTo');
    const subject = document.getElementById('mailSubject');
    const content = document.getElementById('mailContent');
    return {
      to: to ? to.value : '',
      subject: subject ? subject.value : '',
      content: content ? content.value : ''
    };
  }

  clearMailForm() {
    const to = document.getElementById('mailTo');
    const subject = document.getElementById('mailSubject');
    const content = document.getElementById('mailContent');
    if (to) to.value = '';
    if (subject) subject.value = '';
    if (content) content.value = '';
    const mailForm = document.getElementById('sendMailForm');
    if (mailForm) {
      mailForm.style.display = 'none'; // Скрываем форму после отправки
    }
  }

  showMailForm() {
    const mailForm = document.getElementById('sendMailForm');
    if (mailForm) {
      mailForm.style.display = 'block';
    }
  }

  setupTabs(onTabSwitch) {
    const tabButtons = document.querySelectorAll('.profile-tabs button');
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
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.style.display = 'none';
    });
    const activeTab = document.getElementById(`${tab}Tab`);
    if (activeTab) {
      activeTab.style.display = 'block';
    }
  }

  setupToggleCompleted(onToggle) {
    const toggleBtn = document.getElementById('toggleCompleted');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', onToggle);
    }
  }

  setupEditProfile(onSave) {
    const saveBtn = document.querySelector('#editProfileForm button');
    if (saveBtn) {
      saveBtn.addEventListener('click', onSave);
    }
  }

  getEditProfileData() {
    const newPassword = document.getElementById('newPassword');
    const newEmail = document.getElementById('newEmail');
    const newAvatar = document.getElementById('newAvatar');
    return {
      newPassword: newPassword ? newPassword.value : '',
      newEmail: newEmail ? newEmail.value : '',
      newAvatar: newAvatar && newAvatar.files.length > 0 ? newAvatar.files[0] : null
    };
  }

  clearEditProfileForm() {
    const newPassword = document.getElementById('newPassword');
    const newEmail = document.getElementById('newEmail');
    const newAvatar = document.getElementById('newAvatar');
    if (newPassword) newPassword.value = '';
    if (newEmail) newEmail.value = '';
    if (newAvatar) newAvatar.value = '';
  }

  getExpNeeded(level) {
    if (level < 10) {
      return (level) * 100;
    } else if (level < 20) {
      return 5000 + (level - 10) * 1000;
    } else {
      return 25000 + (level - 20) * 2500;
    }
  }

  showOrderDetails(order) {
    const orderDetails = document.getElementById('orderDetails');
    if (orderDetails) {
      orderDetails.innerHTML = `<p><strong>Клиент:</strong> ${order.client}</p><p><strong>Дизайнер:</strong> ${order.designer || 'Не назначен'}</p><p><strong>Требования:</strong> ${order.requirements}</p><p><strong>Размер:</strong> ${order.size} кв.м</p><p><strong>Цена:</strong> ${order.price} руб</p><p><strong>Дата создания:</strong> ${order.createdAt || 'Не указано'}</p><p><strong>Дата принятия:</strong> ${order.takenAt || 'Не указано'}</p><p><strong>Дата завершения:</strong> ${order.completedAt || 'Не указано'}</p><p><strong>Статус:</strong> ${order.status}</p><h3>Фотографии работ:</h3><img src="https://via.placeholder.com/100" alt="Фото 1"><img src="https://via.placeholder.com/100" alt="Фото 2"><img src="https://via.placeholder.com/100" alt="Фото 3">`;
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

  renderStats(stats) {
    let html = `<div class="profile-card">
        <h3>Ваша статистика</h3>
        <p>Всего заказов: ${stats.totalOrders}</p>
        <p>Завершенных заказов: ${stats.completedOrders}</p>
        <p>Средний рейтинг: ${stats.avgRating}/5</p>
        <h4>Прогресс уровня</h4>
        <p>Текущий уровень: ${stats.levelHistory.currentLevel} (${stats.levelHistory.rank})</p>
        <p>Опыт: ${stats.levelHistory.exp} / ${stats.levelHistory.expNeeded}</p>
        <div class="progress-bar"><div class="progress" style="width: ${(stats.levelHistory.exp / stats.levelHistory.expNeeded) * 100}%"></div></div>
    </div>`;
    const userStats = document.getElementById('userStats');
    if (userStats) {
      userStats.innerHTML = html;
    }
  }

  renderAchievements(achievements, coins) {
    let html = `<div class="profile-card">
        <h3>Ваши достижения</h3>
        <p>Монеты Cascabel: ${coins}</p>
        <ul>`;
    if (Object.keys(achievements).length === 0) {
      html += '<li>У вас пока нет достижений.</li>';
    } else {
      for (const [achievement, level] of Object.entries(achievements)) {
        html += `<li>${achievement}: Уровень ${level}</li>`;
      }
    }
    html += `</ul></div>`;
    const achievementsSection = document.getElementById('achievements');
    if (achievementsSection) {
      achievementsSection.innerHTML = html;
    }
  }

  renderPremiumShop(coins, features, onPurchase) {
    let html = `<div class="profile-card">
        <h3>Магазин премиум-функций</h3>
        <p>Ваши монеты: ${coins}</p>
        <h4>Доступные функции</h4>
        <ul>`;
    const availableFeatures = [
      { name: 'ProfileHighlight', title: 'Выделение профиля', cost: 100 },
      { name: 'PriorityListing', title: 'Приоритет в списках', cost: 200 },
      { name: 'ExtraSlots', title: 'Дополнительные слоты для работ', cost: 150 }
    ];
    availableFeatures.forEach(f => {
      const isPurchased = features.includes(f.name);
      html += `<li>${f.title} - ${f.cost} монет ${isPurchased ? '(Куплено)' : `<button data-feature="${f.name}" data-cost="${f.cost}">Купить</button>`}</li>`;
    });
    html += `</ul></div>`;
    const premiumShop = document.getElementById('premiumShop');
    if (premiumShop) {
      premiumShop.innerHTML = html;
      const buttons = premiumShop.querySelectorAll('button[data-feature]');
      buttons.forEach(btn => {
        const feature = btn.getAttribute('data-feature');
        const cost = parseInt(btn.getAttribute('data-cost'));
        btn.addEventListener('click', () => onPurchase(feature, cost));
      });
    }
  }
}