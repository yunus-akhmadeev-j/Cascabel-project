// Хранение текущего пользователя
let currentUser = null;
let lastScrollTop = 0;

// Система почты (заглушка)
export const mailSystem = {
  mailboxes: {}, // Хранилище почты для каждого пользователя

  getMailbox(username) {
    if (!this.mailboxes[username]) {
      this.mailboxes[username] = { inbox: [], sent: [] };
    }
    return this.mailboxes[username].inbox;
  },

  getSentMailbox(username) {
    if (!this.mailboxes[username]) {
      this.mailboxes[username] = { inbox: [], sent: [] };
    }
    return this.mailboxes[username].sent;
  },

  sendMessage(from, to, subject, content) {
    if (!this.mailboxes[to]) {
      this.mailboxes[to] = { inbox: [], sent: [] };
    }
    if (!this.mailboxes[from]) {
      this.mailboxes[from] = { inbox: [], sent: [] };
    }
    const mailId = Date.now();
    const mail = {
      id: mailId,
      from,
      to,
      subject,
      content,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    this.mailboxes[to].inbox.push(mail);
    this.mailboxes[from].sent.push(mail);
  },

  markAsRead(username, mailId) {
    if (this.mailboxes[username]) {
      const mail = this.mailboxes[username].inbox.find(m => m.id === mailId);
      if (mail) {
        mail.read = true;
      }
    }
  },

  sendLevelUpNotification(username, level) {
    if (!this.mailboxes[username]) {
      this.mailboxes[username] = { inbox: [], sent: [] };
    }
    const mail = {
      id: Date.now(),
      from: 'System',
      to: username,
      subject: 'Повышение уровня!',
      content: `Поздравляем! Вы достигли уровня ${level}!`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    this.mailboxes[username].inbox.push(mail);
  }
};

// Управление текущим пользователем

export function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser() {
  if (!currentUser) {
    try {
      const storedUser = localStorage.getItem('currentUser');
      currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (currentUser && !currentUser.id) {
        localStorage.removeItem('currentUser');
        currentUser = null;
      }
    } catch (error) {
      console.error('Error parsing currentUser from localStorage:', error);
      localStorage.removeItem('currentUser');
      currentUser = null;
    }
  }
  return currentUser;
}

// Функция для выполнения API-запросов
export async function apiRequest(endpoint, method = 'GET', data = null) {
  const baseUrl = 'http://localhost:3000';
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  try {
    console.log(`Making ${method} request to ${url}`); // Логирование запроса
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API error for ${url}:`, error);
    throw error;
  }
}

// Остальные функции без изменений
export function toggleNav() {
  const nav = document.querySelector('nav');
  const menuToggle = document.getElementById('menuToggle');
  const container = document.querySelector('.container');
  if (nav && menuToggle && container) {
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    if (nav.classList.contains('active')) {
      container.style.marginTop = '120px';
    } else {
      container.style.marginTop = '100px';
    }
  }
}

export function updateNav() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;
  const orderBtn = document.querySelector('a[href="order.html"]');
  const ordersListBtn = document.querySelector('a[href="ordersList.html"]');
  const profileBtn = document.querySelector('a[href="profile.html"]');
  const user = getCurrentUser();
  if (user) {
    // Используем локальную заглушку или проверяем наличие аватара
    const avatarUrl = user.avatar || 'https://thumbs.dreamstime.com/b/user-profile-line-icon-web-avatar-employee-symbol-sign-illustration-design-isolated-white-background-192379539.jpg;' // Локальный путь к заглушке
    authContainer.innerHTML = `<button id="logoutBtn">Выйти</button><a href="profile.html"><img id="profileAvatar" src="${avatarUrl}" alt="${user.name || 'Пользователь'}" title="Профиль"></a>`;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => logout());
    }
    if (user.role === 'Client') {
      orderBtn.style.display = 'block';
      ordersListBtn.style.display = 'none';
    } else if (user.role === 'Designer') {
      orderBtn.style.display = 'none';
      ordersListBtn.style.display = 'block';
    }
    profileBtn.style.display = 'block';
  } else {
    authContainer.innerHTML = `<a id="authBtn" href="auth.html">Авторизация</a>`;
    orderBtn.style.display = 'none';
    ordersListBtn.style.display = 'none';
    profileBtn.style.display = 'none';
  }
    const adminItem = document.querySelector('li.admin-only');
  if (adminItem && user) {
    adminItem.setAttribute('data-role', user.role);
  } else if (adminItem) {
    adminItem.setAttribute('data-role', '');
  }
}

export function logout() {
  if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
    setCurrentUser(null);
    updateNav();
    window.location.href = 'index.html';
  }
}

export function setupScrollBehavior() {
  window.onscroll = function () {
    let scrollTopBtn = document.getElementById('scrollTop');
    let menuToggle = document.getElementById('menuToggle');
    let authContainer = document.getElementById('authContainer');
    let header = document.querySelector('header');
    let footer = document.querySelector('footer');
    let currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    if (currentScrollTop > 20) {
      if (scrollTopBtn) scrollTopBtn.style.display = 'block';
      if (menuToggle) menuToggle.classList.add('hidden');
      if (authContainer) authContainer.classList.add('hidden');
    } else {
      if (scrollTopBtn) scrollTopBtn.style.display = 'none';
      if (menuToggle) menuToggle.classList.remove('hidden');
      if (authContainer) authContainer.classList.remove('hidden');
    }
    if (header) {
      if (currentScrollTop > lastScrollTop && currentScrollTop > 20) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
    }
    if (footer) {
      if ((window.innerHeight + currentScrollTop) >= document.body.offsetHeight) {
        footer.classList.add('visible');
      } else {
        footer.classList.remove('visible');
      }
    }
    lastScrollTop = currentScrollTop;
  };
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export class UserLevel {
  constructor(level = 1, exp = 0) {
    this.level = level;
    this.exp = exp;
    this.rank = this.calculateRank();
  }

  calculateRank() {
    if (this.level <= 10) return 'Bronze';
    if (this.level <= 20) return 'Silver';
    if (this.level <= 29) return 'Gold';
    return 'Platinum';
  }

  addExp(amount) {
    this.exp += amount;
    let expNeeded = 100 * Math.pow(2, this.level - 1);
    let levelIncreased = false;
    while (this.exp >= expNeeded && this.level < 30) {
      this.level++;
      levelIncreased = true;
      this.exp -= expNeeded;
      expNeeded = 100 * Math.pow(2, this.level - 1);
      this.rank = this.calculateRank();
    }
    return levelIncreased;
  }
}