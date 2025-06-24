import { apiRequest, getCurrentUser, setCurrentUser, mailSystem, updateNav } from '../common.js';

export class ProfilePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.currentTab = 'info';
    this.showCompleted = false;
    this.showMailSection = 'inbox'; // По умолчанию отображаем входящие
    this.inboxMessages = [];
    this.sentMessages = [];
    this.lastMailSection = 'inbox'; // Для отслеживания изменений состояния
    this.isRendering = false; // Флаг для предотвращения многократного рендеринга
  }

  async initialize() {
    const user = getCurrentUser();
    if (!user) {
      alert('Пожалуйста, войдите в систему.');
      window.location.href = 'auth.html';
      return;
    }
    try {
      const userProfile = await this.model.getUserProfile(user.name);
      this.view.renderProfile(userProfile);
    } catch (error) {
      console.error('Error rendering profile:', error);
      this.view.renderProfile(user);
    }

    this.view.setupTabs((tab) => this.switchTab(tab));
    this.view.setupToggleCompleted(() => this.toggleCompletedOrders());
    this.view.setupEditProfile(() => this.updateProfile());

    try {
      const orders = await this.model.getActiveOrders(user.name);
      this.view.renderOrders(
        orders,
        (orderId) => this.confirmOrderByDesigner(orderId),
        (orderId) => this.confirmOrderByClient(orderId),
        (orderId) => this.showOrderDetails(orderId)
      );
    } catch (error) {
      console.error('Error rendering orders:', error);
      this.view.renderOrders([], () => {}, () => {}, () => {});
    }

    try {
      const stats = await this.model.getUserStats(user.name);
      this.view.renderStats(stats);
    } catch (error) {
      console.error('Error rendering stats:', error);
      this.view.renderStats({
        totalOrders: 0,
        completedOrders: 0,
        avgRating: 0,
        levelHistory: { currentLevel: 1, exp: 0, expNeeded: 100, rank: 'Bronze' }
      });
    }

    // Инициализация почты
    try {
      this.inboxMessages = await apiRequest(`/api/messages/inbox/${encodeURIComponent(user.name)}`);
      this.sentMessages = await apiRequest(`/api/messages/sent/${encodeURIComponent(user.name)}`);
    } catch (error) {
      console.error('Error loading messages:', error);
      this.inboxMessages = [];
      this.sentMessages = [];
    }
    // Устанавливаем начальную видимость входящих сообщений
    this.view.isInboxVisible = true;
    this.view.isSentVisible = false;
    this.renderMailSection();

    // Инициализация достижений и магазина
    const achievements = { "Новичок": 1 }; // Заглушка
    const coins = await this.model.getUserCoins(user.name);
    const features = await this.model.getUserPremiumFeatures(user.name);
    console.log('User premium features:', features);
    this.view.renderAchievements(achievements, coins);
    this.view.renderPremiumShop(coins, features, (feature, cost) => this.purchasePremiumFeature(feature, cost));

    // Делаем объекты доступными глобально для вызова из HTML (для пагинации)
    window.profileView = this.view;
    window.profilePresenter = this;
  }

  // Метод для рендера раздела почты
  renderMailSection() {
    // Защита от многократного вызова
    if (this.isRendering) {
      console.log('Render in progress, skipping...');
      return;
    }
    this.isRendering = true;

    // Проверяем, изменилось ли состояние
    if (this.lastMailSection !== this.showMailSection) {
      console.log('Mail section changed, resetting render flag...');
      this.view.isMailRendered = false;
      this.lastMailSection = this.showMailSection;
    }
    // Логируем, откуда вызывается метод для отладки
    console.log('renderMailSection called from:', new Error().stack.split('\n')[2]);
    this.view.renderMail(
      this.inboxMessages, this.sentMessages,
      () => this.sendMail(),
      (mailId) => this.markMailAsRead(mailId),
      () => this.showInbox(),
      () => this.showSent(),
      (mailId, type) => this.showMessageDetails(mailId, type)
    );

    // Сбрасываем флаг после завершения рендеринга
    setTimeout(() => {
      this.isRendering = false;
    }, 0);
  }

  showInbox() {
    // Если текущая вкладка уже "inbox", переключаем видимость списка
    if (this.showMailSection === 'inbox') {
      this.view.isInboxVisible = !this.view.isInboxVisible; // Переключаем видимость списка входящих
    } else {
      this.showMailSection = 'inbox';
      this.view.showMailSection = this.showMailSection;
      this.view.isInboxVisible = true; // Показываем входящие при переключении
      this.view.isSentVisible = false; // Скрываем отправленные
    }
    this.view.isMailRendered = false; // Сбрасываем флаг для рендеринга
    this.renderMailSection();
  }

  showSent() {
    // Если текущая вкладка уже "sent", переключаем видимость списка
    if (this.showMailSection === 'sent') {
      this.view.isSentVisible = !this.view.isSentVisible; // Переключаем видимость списка отправленных
    } else {
      this.showMailSection = 'sent';
      this.view.showMailSection = this.showMailSection;
      this.view.isInboxVisible = false; // Скрываем входящие
      this.view.isSentVisible = true; // Показываем отправленные при переключении
    }
    this.view.isMailRendered = false; // Сбрасываем флаг для рендеринга
    this.renderMailSection();
  }

  async showMessageDetails(mailId, type) {
    const messages = type === 'inbox' ? this.inboxMessages : this.sentMessages;
    const mail = messages.find(m => m.id === mailId);
    if (mail) {
      this.view.showMessageDetails(mail, type);
      // Если сообщение непрочитанное и это входящее, отмечаем как прочитанное
      if (type === 'inbox' && !mail.read) {
        await this.markMailAsRead(mailId);
      }
    } else {
      alert('Сообщение не найдено.');
    }
  }

  async sendMail() {
    const user = getCurrentUser();
    const data = this.view.getMailData();
    if (data.to && data.subject && data.content) {
      try {
        console.log('Sending message with data:', data);
        await apiRequest('/api/messages', 'POST', {
          from_user: user.name,
          to_user: data.to,
          subject: data.subject,
          content: data.content
        });
        alert('Сообщение отправлено!');
        this.view.clearMailForm();
        // Обновляем данные о сообщениях
        this.inboxMessages = await apiRequest(`/api/messages/inbox/${encodeURIComponent(user.name)}`);
        this.sentMessages = await apiRequest(`/api/messages/sent/${encodeURIComponent(user.name)}`);
        this.view.isMailRendered = false; // Сбрасываем флаг для обновления
        this.renderMailSection();
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Ошибка при отправке сообщения. Попробуйте снова.');
      }
    } else {
      alert('Заполните все поля для отправки сообщения.');
    }
  }

  async markMailAsRead(mailId) {
    const user = getCurrentUser();
    try {
      await apiRequest(`/api/messages/${mailId}/read`, 'PUT');
      // Обновляем данные о сообщениях
      this.inboxMessages = await apiRequest(`/api/messages/inbox/${encodeURIComponent(user.name)}`);
      this.sentMessages = await apiRequest(`/api/messages/sent/${encodeURIComponent(user.name)}`);
      this.view.isMailRendered = false; // Сбрасываем флаг для обновления
      this.renderMailSection();
    } catch (error) {
      console.error('Error marking message as read:', error);
      alert('Ошибка при отметке сообщения как прочитанного.');
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.view.switchTab(tab);
    if (tab === 'mail') {
      // При переходе на вкладку "mail" проверяем текущее состояние
      if (this.showMailSection === 'inbox') {
        this.view.isInboxVisible = true;
        this.view.isSentVisible = false;
      } else {
        this.view.isInboxVisible = false;
        this.view.isSentVisible = true;
      }
      this.view.isMailRendered = false; // Сбрасываем флаг при переходе на вкладку
      this.renderMailSection();
    }
  }

  async confirmOrderByDesigner(orderId) {
    try {
      if (await this.model.confirmOrderByDesigner(orderId)) {
        alert('Заказ отправлен на проверку клиенту!');
        const user = getCurrentUser();
        const order = await this.model.getOrderById(orderId);
        if (order) {
          mailSystem.sendMessage(
            user.name,
            order.client,
            'Заказ выполнен',
            `Ваш заказ "${order.requirements}" выполнен дизайнером. Пожалуйста, подтвердите завершение в личном кабинете.`
          );
        }
        const orders = await this.model.getActiveOrders(user.name);
        this.view.renderOrders(
          orders,
          (id) => this.confirmOrderByDesigner(id),
          (id) => this.confirmOrderByClient(id),
          (id) => this.showOrderDetails(id)
        );
      } else {
        alert('Ошибка при подтверждении заказа.');
      }
    } catch (error) {
      console.error('Error confirming order by designer:', error);
      alert('Ошибка при подтверждении заказа.');
    }
  }

  async confirmOrderByClient(orderId) {
    try {
      if (await this.model.confirmOrderByClient(orderId)) {
        alert('Заказ завершен!');
        const user = getCurrentUser();
        const orders = await this.model.getActiveOrders(user.name);
        const completedOrders = await this.model.getCompletedOrders(user.name);
        this.view.renderOrders(
          orders,
          (id) => this.confirmOrderByDesigner(id),
          (id) => this.confirmOrderByClient(id),
          (id) => this.showOrderDetails(id)
        );
        this.view.renderCompletedOrders(completedOrders, (id) => this.showOrderDetails(id));
        // Обновляем опыт и уровень
        const order = await this.model.getOrderById(orderId);
        if (order) {
          const designerExp = this.model.getExpByRank(order.designer ? (await this.model.getUserProfile(order.designer)).rank : 'Bronze');
          const designerLevelUp = await this.model.updateUserExp(order.designer, designerExp);
          if (designerLevelUp) {
            mailSystem.sendLevelUpNotification(order.designer, designerLevelUp);
          }
          const clientExp = this.model.getExpByRank((await this.model.getUserProfile(order.client)).rank);
          const clientLevelUp = await this.model.updateUserExp(order.client, clientExp);
          if (clientLevelUp) {
            mailSystem.sendLevelUpNotification(order.client, clientLevelUp);
          }
        }
      } else {
        alert('Ошибка при подтверждении заказа.');
      }
    } catch (error) {
      console.error('Error confirming order by client:', error);
      alert('Ошибка при подтверждении заказа.');
    }
  }

  async toggleCompletedOrders() {
    this.showCompleted = !this.showCompleted;
    const user = getCurrentUser();
    try {
      const completedOrders = await this.model.getCompletedOrders(user.name);
      this.view.showCompleted = this.showCompleted;
      this.view.renderCompletedOrders(completedOrders, (id) => this.showOrderDetails(id));
    } catch (error) {
      console.error('Error toggling completed orders:', error);
      this.view.renderCompletedOrders([], (id) => this.showOrderDetails(id));
    }
  }

  async updateProfile() {
    const user = getCurrentUser();
    const data = this.view.getEditProfileData();
    try {
      let newAvatarUrl = user.avatar || '';
      if (data.newAvatar) {
        newAvatarUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(data.newAvatar);
        });
      }
      await this.model.updateUserProfile(user.name, data.newPassword, data.newEmail, newAvatarUrl);
      alert('Изменения сохранены!');
      const updatedUser = await this.model.getUserProfile(user.name);
      setCurrentUser(updatedUser);
      updateNav();
      this.view.renderProfile(updatedUser);
      this.view.clearEditProfileForm();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при сохранении изменений.');
    }
  }

  async showOrderDetails(orderId) {
    try {
      const order = await this.model.getOrderById(orderId);
      if (order) {
        this.view.showOrderDetails(order);
      }
    } catch (error) {
      console.error('Error showing order details:', error);
      alert('Ошибка при загрузке деталей заказа.');
    }
  }

  async purchasePremiumFeature(feature, cost) {
    const user = getCurrentUser();
    try {
      const success = await this.model.purchasePremiumFeature(user.name, feature, cost);
      if (success) {
        alert(`Премиум-функция "${feature}" успешно куплена!`);
        const updatedUser = await this.model.getUserProfile(user.name);
        setCurrentUser(updatedUser);
        const coins = await this.model.getUserCoins(user.name);
        const features = await this.model.getUserPremiumFeatures(user.name);
        this.view.renderPremiumShop(coins, features, (f, c) => this.purchasePremiumFeature(f, c));
      } else {
        alert('Недостаточно монет для покупки.');
      }
    } catch (error) {
      console.error('Error purchasing premium feature:', error);
      alert('Ошибка при покупке премиум-функции.');
    }
  }
}