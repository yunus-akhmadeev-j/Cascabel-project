const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
const users = require('./routes/users');
const orders = require('./routes/orders');
const works = require('./routes/works');
const reviews = require('./routes/reviews');
const styles = require('./routes/styles');
const services = require('./routes/services');
const messages = require('./routes/messages');
const analytics = require('./routes/analytics');

// Подключение маршрутов
app.use('/api/users', users);
app.use('/api/orders', orders);
app.use('/api/works', works);
app.use('/api/reviews', reviews);
app.use('/api/styles', styles);
app.use('/api/services', services);
app.use('/api/messages', messages);
app.use('/api/analytics', analytics);

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('Cascabel API is running');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});