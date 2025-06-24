const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Создание заказа
router.post('/', async (req, res) => {
  const { client, requirements, size, price } = req.body;
  try {
    console.log('Creating order with data:', { client, requirements, size, price });
    if (!client || !requirements || !size || !price) {
      console.log('Missing required fields in request body');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const clientResult = await pool.query('SELECT * FROM users WHERE name = $1', [client]);
    if (clientResult.rows.length === 0) {
      console.log(`Client ${client} not found`);
      return res.status(404).json({ error: 'Client not found' });
    }
    console.log('Client found:', clientResult.rows[0].name);
    const result = await pool.query(
      `INSERT INTO orders (client, requirements, size, price, status, created_at, designer, taken_at, under_review_at, completed_at)
       VALUES ($1, $2, $3, $4, 'Open', CURRENT_TIMESTAMP, NULL, NULL, NULL, NULL) RETURNING *`,
      [client, requirements, size, price]
    );
    const order = result.rows[0];
    console.log('Order created successfully:', order);
    await pool.query(
      `UPDATE users SET current_orders = array_append(current_orders, $1) WHERE name = $2`,
      [order.id, client]
    );
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error.message, error.stack);
    if (error.message.includes('нарушает ограничение внешнего ключа') || error.message.includes('violates foreign key constraint')) {
      res.status(400).json({ error: 'Invalid data: Designer does not exist in users table' });
    } else {
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
});

// Получение всех заказов
router.get('/', async (req, res) => {
  const { client, designer, status } = req.query;
  let query = 'SELECT * FROM orders';
  let params = [];
  let conditions = [];

  if (client) {
    conditions.push(`client = $${conditions.length + 1}`);
    params.push(client);
  }
  if (designer) {
    conditions.push(`designer = $${conditions.length + 1}`);
    params.push(designer);
  }
  if (status) {
    conditions.push(`status = $${conditions.length + 1}`);
    params.push(status);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ` ORDER BY created_at DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Получение заказа по ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Взятие заказа дизайнером
router.put('/:id/take', async (req, res) => {
  const { id } = req.params;
  const { designer } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'In Progress', designer = $1, taken_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'Open' RETURNING *`,
      [designer, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or already taken' });
    }
    const order = result.rows[0];
    // Обновляем текущие заказы дизайнера
    await pool.query(
      `UPDATE users SET current_orders = array_append(current_orders, $1) WHERE name = $2`,
      [order.id, designer]
    );
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to take order' });
  }
});

// Подтверждение выполнения дизайнером (перевод в статус "Under Review")
router.put('/:id/confirm-designer', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'Under Review', under_review_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'In Progress' RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or not in progress' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm order by designer' });
  }
});

// Подтверждение завершения клиентом (перевод в статус "Completed")
router.put('/:id/confirm-client', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'Completed', completed_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'Under Review' RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or not under review' });
    }
    const order = result.rows[0];
    // Обновляем текущие и завершенные заказы для клиента и дизайнера
    await pool.query(
      `UPDATE users SET current_orders = array_remove(current_orders, $1), completed_orders = array_append(completed_orders, $1) WHERE name = $2 OR name = $3`,
      [order.id, order.client, order.designer]
    );
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm order by client' });
  }
});

// Удаление заказа
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orderResult.rows[0];
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    // Удаляем заказ из текущих и завершенных у пользователя
    await pool.query(
      `UPDATE users SET current_orders = array_remove(current_orders, $1), completed_orders = array_remove(completed_orders, $1) WHERE name = $2 OR name = $3`,
      [id, order.client, order.designer || '']
    );
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;