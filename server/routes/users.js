const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Проверка на уникальность имени и email
    const checkResult = await pool.query(
      `SELECT * FROM users WHERE name = $1 OR email = $2`,
      [name, email]
    );
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'User with this name or email already exists' });
    }
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, level, exp, rank, is_blocked, coins, achievements, premium_features, achievements_checked, current_orders, completed_orders, avatar)
       VALUES ($1, $2, $3, $4, 1, 0, 'Bronze', FALSE, 0, '{}', '{}', FALSE, '{}', '{}', '') RETURNING *`,
      [name, email, password, role || 'Client']
    );
    const user = result.rows[0];
    res.json({ user });
  } catch (error) {
    console.error('Error registering user:', error.message, error.stack);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Duplicate key error: ID or other unique field already exists' });
    }
    res.status(500).json({ error: 'Не получилось зарегистрировать пользователя' });
  }
});
// Эндпоинт для получения текущего пользователя
router.get('/currentUser', async (req, res) => {
  try {
    // Предполагается, что пользователь аутентифицирован, и его данные доступны через middleware
    // Например, через токен в заголовке Authorization или сессию
    const userId = req.session?.userId || req.user?.id; // Зависит от используемой системы авторизации
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
if (result.rows.length === 0) {
  return res.status(404).json({ error: 'User not found' });
}

res.json(result.rows[0]);
  
} catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE name = $1 OR email = $1`,
      [identifier]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Такого пользователя не существует' });
    }
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Пользователь заблокирован' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось войти в аккаунт' });
  }
});

// Получение списка пользователей
router.get('/', async (req, res) => {
  const { role } = req.query;
  try {
    let query = 'SELECT * FROM users';
    let params = [];
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ' ORDER BY level DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Получение пользователя по имени
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Обновление профиля пользователя
router.put('/:username', async (req, res) => {
  const { username } = req.params;
  const { password, email, avatar } = req.body;
  try {
    let query = 'UPDATE users SET ';
    let params = [];
    let updates = [];
    if (password) {
      updates.push(`password = $${updates.length + 1}`);
      params.push(password);
    }
    if (email) {
      updates.push(`email = $${updates.length + 1}`);
      params.push(email);
    }
    if (avatar) {
      updates.push(`avatar = $${updates.length + 1}`);
      params.push(avatar);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    query += updates.join(', ');
    query += ` WHERE name = $${updates.length + 1} RETURNING *`;
    params.push(username);
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Блокировка/разблокировка пользователя
router.put('/:username/block', async (req, res) => {
  const { username } = req.params;
  const { isBlocked } = req.body;
  try {
    console.log(`Updating block status for user ${username} to ${isBlocked}`); // Логирование
    const result = await pool.query(
      `UPDATE users SET is_blocked = $1 WHERE name = $2 RETURNING *`,
      [isBlocked, username]
    );
    if (result.rows.length === 0) {
      console.log(`User ${username} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`Block status updated for user ${username}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating block status for user ${username}:`, error);
    res.status(500).json({ error: 'Failed to update user block status' });
  }
});

// Обновление опыта и уровня пользователя
router.put('/:username/experience', async (req, res) => {
  const { username } = req.params;
  const { exp } = req.body;
  try {
    // Получаем текущего пользователя
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    const newExp = user.exp + exp;
    let newLevel = user.level;
    let expNeeded = getExpNeeded(newLevel);
    while (newExp >= expNeeded && newLevel < 30) {
      newLevel++;
      expNeeded = getExpNeeded(newLevel);
    }
    const remainingExp = newExp >= expNeeded ? 0 : newExp;
    const newRank = calculateRank(newLevel);
    const updateResult = await pool.query(
      `UPDATE users SET exp = $1, level = $2, rank = $3 WHERE name = $4 RETURNING *`,
      [remainingExp, newLevel, newRank, username]
    );
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user experience' });
  }
});

// Добавление достижений пользователю
router.put('/:username/achievements', async (req, res) => {
  const { username } = req.params;
  const { achievementId, level } = req.body; // Ожидается объект с id и уровнем достижения
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    let achievements = user.achievements || {};
    const achievementKey = `${achievementId}_L${level}`;
    if (!achievements[achievementKey]) {
      achievements[achievementKey] = { id: achievementId, level };
      const updateResult = await pool.query(
        `UPDATE users SET achievements = $1, achievements_checked = TRUE WHERE name = $2 RETURNING *`,
        [achievements, username]
      );
      res.json(updateResult.rows[0]);
    } else {
      res.json(user); // Достижение уже есть, возвращаем пользователя без изменений
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user achievements' });
  }
});

// Покупка премиум-функции
router.put('/:username/premium', async (req, res) => {
  const { username } = req.params;
  const { feature, cost } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    if (user.coins < cost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }
    let premiumFeatures = user.premium_features || [];
    if (!premiumFeatures.includes(feature)) {
      premiumFeatures.push(feature);
      const newCoins = user.coins - cost;
      const updateResult = await pool.query(
        `UPDATE users SET premium_features = $1, coins = $2 WHERE name = $3 RETURNING *`,
        [premiumFeatures, newCoins, username]
      );
      res.json(updateResult.rows[0]);
    } else {
      res.json(user); // Функция уже куплена, возвращаем пользователя без изменений
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to purchase premium feature' });
  }
});

// Добавление монет пользователю
router.put('/:username/coins', async (req, res) => {
  const { username } = req.params;
  const { amount } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    const newCoins = (user.coins || 0) + amount;
    const updateResult = await pool.query(
      `UPDATE users SET coins = $1 WHERE name = $2 RETURNING *`,
      [newCoins, username]
    );
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user coins' });
  }
});

// Обновление текущих и завершенных заказов пользователя
router.put('/:username/orders', async (req, res) => {
  const { username } = req.params;
  const { orderId, isCompleted } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    let currentOrders = user.current_orders || [];
    let completedOrders = user.completed_orders || [];

    if (isCompleted) {
      // Удаляем из текущих заказов, если он там есть
      currentOrders = currentOrders.filter(id => id !== orderId);
      // Добавляем в завершенные, если его там нет
      if (!completedOrders.includes(orderId)) {
        completedOrders.push(orderId);
      }
    } else {
      // Добавляем в текущие заказы, если его там нет
      if (!currentOrders.includes(orderId)) {
        currentOrders.push(orderId);
      }
    }

    const updateResult = await pool.query(
      `UPDATE users SET current_orders = $1, completed_orders = $2 WHERE name = $3 RETURNING *`,
      [currentOrders, completedOrders, username]
    );
    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user orders' });
  }
});

// Вспомогательная функция для расчета необходимого опыта
function getExpNeeded(level) {
  if (level < 10) {
    return level * 100;
  } else if (level < 20) {
    return 5000 + (level - 10) * 1000;
  } else {
    return 25000 + (level - 20) * 2500;
  }
}

// Вспомогательная функция для расчета ранга
function calculateRank(level) {
  if (level <= 10) return 'Bronze';
  if (level <= 20) return 'Silver';
  if (level <= 29) return 'Gold';
  return 'Platinum';
}

module.exports = router;