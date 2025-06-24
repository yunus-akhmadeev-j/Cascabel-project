const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение аналитики для конкретного пользователя
router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`Request received for user stats: ${username}`);
  try {
    // Получение данных пользователя
    const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
    if (userResult.rows.length === 0) {
      console.log(`User ${username} not found`);
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    console.log(`User ${username} found, fetching stats...`);

    // Получение заказов пользователя
    const ordersResult = await pool.query(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'Completed') AS completed
       FROM orders WHERE client = $1 OR designer = $1`,
      [username]
    );
    const totalOrders = parseInt(ordersResult.rows[0].total) || 0;
    const completedOrders = parseInt(ordersResult.rows[0].completed) || 0;

    // Получение среднего рейтинга
    const reviewsResult = await pool.query(
      `SELECT AVG(rating) AS avg_rating FROM reviews WHERE author = $1 OR target = $1`,
      [username]
    );
    const avgRating = parseFloat(reviewsResult.rows[0].avg_rating) || 0;

    console.log(`Stats for ${username}: Orders=${totalOrders}, Completed=${completedOrders}, Rating=${avgRating}`);
    res.json({
      totalOrders,
      completedOrders,
      avgRating: avgRating.toFixed(1),
      levelHistory: {
        currentLevel: user.level || 1,
        exp: user.exp || 0,
        expNeeded: getExpNeeded(user.level || 1),
        rank: user.rank || 'Bronze'
      }
    });
  } catch (error) {
    console.error(`Error processing request for user ${username}:`, error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Получение общей аналитики для платформы
router.get('/', async (req, res) => {
  try {
    console.log('Fetching platform-wide analytics...');
    // Получение статистики по пользователям
    const usersResult = await pool.query(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE last_login IS NOT NULL AND last_login > NOW() - INTERVAL '30 days') AS active
       FROM users`
    );
    const totalUsers = parseInt(usersResult.rows[0].total) || 0;
    const activeUsers = parseInt(usersResult.rows[0].active) || 0;

    // Получение статистики по заказам
    const ordersResult = await pool.query(
      `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'Completed') AS completed
       FROM orders`
    );
    const totalOrders = parseInt(ordersResult.rows[0].total) || 0;
    const completedOrders = parseInt(ordersResult.rows[0].completed) || 0;

    // Получение статистики по работам
    const worksResult = await pool.query(`SELECT COUNT(*) AS total FROM works`);
    const totalWorks = parseInt(worksResult.rows[0].total) || 0;

    // Получение статистики по отзывам
    const reviewsResult = await pool.query(`SELECT COUNT(*) AS total FROM reviews`);
    const totalReviews = parseInt(reviewsResult.rows[0].total) || 0;

    // Получение популярных стилей работ
    const stylesResult = await pool.query(
      `SELECT style, COUNT(*) AS count FROM works GROUP BY style ORDER BY count DESC LIMIT 5`
    );
    const popularStyles = stylesResult.rows.map(row => [row.style, parseInt(row.count)]);

    console.log('Platform analytics fetched successfully.');
    res.json({
      totalUsers,
      activeUsers,
      totalOrders,
      completedOrders,
      totalWorks,
      totalReviews,
      popularStyles
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
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

module.exports = router;