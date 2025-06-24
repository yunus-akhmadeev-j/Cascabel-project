const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение всех услуг
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Добавление новой услуги
router.post('/', async (req, res) => {
  const { type, styles, sub_services } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO services (type, styles, sub_services)
       VALUES ($1, $2, $3) RETURNING *`,
      [type, styles, sub_services]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

module.exports = router;