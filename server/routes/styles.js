const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение всех стилей
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM styles');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch styles' });
  }
});

// Добавление нового стиля
router.post('/', async (req, res) => {
  const { name, description, image } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO styles (name, description, image)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, image]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create style' });
  }
});

module.exports = router;