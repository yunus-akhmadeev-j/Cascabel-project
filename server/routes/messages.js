const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Отправка сообщения
router.post('/', async (req, res) => {
    const { from_user, to_user, subject, content } = req.body;
    try {
        console.log('Sending message from', from_user, 'to', to_user);
        // Проверка существования отправителя и получателя
        const senderResult = await pool.query('SELECT * FROM users WHERE name = $1', [from_user]);
        if (senderResult.rows.length === 0) {
            console.log(`Sender ${from_user} not found`);
            return res.status(404).json({ error: 'Sender not found' });
        }
        const receiverResult = await pool.query('SELECT * FROM users WHERE name = $1', [to_user]);
        if (receiverResult.rows.length === 0) {
            console.log(`Receiver ${to_user} not found`);
            return res.status(404).json({ error: 'Receiver not found' });
        }
        const sender = senderResult.rows[0];
        if (sender.is_blocked) {
            console.log(`Sender ${from_user} is blocked`);
            return res.status(403).json({ error: 'Sender is blocked' });
        }
        const result = await pool.query(
            `INSERT INTO messages (from_user, to_user, subject, content, date, read)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, FALSE) RETURNING *`,
            [from_user, to_user, subject, content]
        );
        console.log('Message sent successfully:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Получение входящих сообщений пользователя
router.get('/inbox/:username', async (req, res) => {
    const { username } = req.params;
    try {
        console.log('Fetching inbox messages for user:', username);
        // Проверка существования пользователя
        const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
        if (userResult.rows.length === 0) {
            console.log(`User ${username} not found`);
            return res.status(404).json({ error: 'User not found' });
        }
        const result = await pool.query('SELECT * FROM messages WHERE to_user = $1 ORDER BY date DESC', [username]);
        console.log(`Found ${result.rows.length} inbox messages for ${username}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inbox messages:', error);
        res.status(500).json({ error: 'Failed to fetch inbox messages' });
    }
});

// Получение отправленных сообщений пользователя
router.get('/sent/:username', async (req, res) => {
    const { username } = req.params;
    try {
        console.log('Fetching sent messages for user:', username);
        // Проверка существования пользователя
        const userResult = await pool.query('SELECT * FROM users WHERE name = $1', [username]);
        if (userResult.rows.length === 0) {
            console.log(`User ${username} not found`);
            return res.status(404).json({ error: 'User not found' });
        }
        const result = await pool.query('SELECT * FROM messages WHERE from_user = $1 ORDER BY date DESC', [username]);
        console.log(`Found ${result.rows.length} sent messages for ${username}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(500).json({ error: 'Failed to fetch sent messages' });
    }
});

// Отметка сообщения как прочитанного
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        console.log('Marking message as read, ID:', id);
        // Проверка существования сообщения
        const messageResult = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
        if (messageResult.rows.length === 0) {
            console.log(`Message with ID ${id} not found`);
            return res.status(404).json({ error: 'Message not found' });
        }
        const message = messageResult.rows[0];
        if (message.read) {
            console.log(`Message with ID ${id} is already marked as read`);
            return res.status(400).json({ error: 'Message already read' });
        }
        const result = await pool.query(
            `UPDATE messages SET read = TRUE WHERE id = $1 RETURNING *`,
            [id]
        );
        console.log('Message marked as read successfully:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

module.exports = router;