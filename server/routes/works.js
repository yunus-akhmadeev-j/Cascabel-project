const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение всех работ
router.get('/', async (req, res) => {
  const { style, type, uploader } = req.query;
  let query = 'SELECT * FROM works';
  let params = [];
  let conditions = [];

  if (style) {
    conditions.push(`style = $${conditions.length + 1}`);
    params.push(style);
  }
  if (type) {
    conditions.push(`type = $${conditions.length + 1}`);
    params.push(type);
  }
  if (uploader) {
    conditions.push(`uploader = $${conditions.length + 1}`);
    params.push(uploader);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  // Добавляем пробел перед ORDER BY
  query += ' ORDER BY id DESC';

  try {
    console.log('Executing query:', query);
    console.log('With parameters:', params);
    const result = await pool.query(query, params);
    console.log('Query result:', result.rows.length, 'rows returned');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query:', error.message);
    console.error('Full error object:', error);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

// Остальной код без изменений
router.post('/', async (req, res) => {
  const { title, image, style, type, uploader } = req.body;
  try {
    console.log('Creating new work with data:', { title, image, style, type, uploader });
    const result = await pool.query(
      `INSERT INTO works (title, image, style, type, uploader)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, image, style, type, uploader]
    );
    console.log('Work created:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating work:', error.message);
    console.error('Full error object:', error);
    res.status(500).json({ error: 'Failed to create work' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Fetching work with ID:', id);
    const result = await pool.query('SELECT * FROM works WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching work:', error.message);
    res.status(500).json({ error: 'Failed to fetch work' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Deleting work with ID:', id);
    const result = await pool.query('DELETE FROM works WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work not found' });
    }
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Error deleting work:', error.message);
    res.status(500).json({ error: 'Failed to delete work' });
  }
});

module.exports = router;