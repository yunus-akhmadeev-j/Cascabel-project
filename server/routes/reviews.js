const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Создание нового отзыва
router.post('/', async (req, res) => {
  const { author, text, date, avatar, order_id, rating, target } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO reviews (author, text, date, avatar, order_id, rating, target)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [author, text, date || new Date().toISOString().split('T')[0], avatar || '', order_id || null, rating || 0, target || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Получение всех отзывов
router.get('/', async (req, res) => {
  const { author, target, order_id } = req.query;
  let query = 'SELECT * FROM reviews';
  let params = [];
  let conditions = [];

  if (author) {
    conditions.push(`author = $${conditions.length + 1}`);
    params.push(author);
  }
  if (target) {
    conditions.push(`target = $${conditions.length + 1}`);
    params.push(target);
  }
  if (order_id) {
    conditions.push(`order_id = $${conditions.length + 1}`);
    params.push(order_id);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ` ORDER BY date DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Получение отзыва по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Удаление отзыва
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;