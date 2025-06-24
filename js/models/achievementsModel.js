import { db } from '../common.js';

export class AchievementsModel {
    constructor() {
        this.achievements = [
            { id: 'OrderMaster', name: 'Мастер заказов', levels: [
                { level: 1, requirement: 5, reward: 50, desc: 'Завершить 5 заказов' },
                { level: 2, requirement: 10, reward: 100, desc: 'Завершить 10 заказов' },
                { level: 3, requirement: 20, reward: 200, desc: 'Завершить 20 заказов' },
                { level: 4, requirement: 50, reward: 500, desc: 'Завершить 50 заказов' },
                { level: 5, requirement: 100, reward: 1000, desc: 'Завершить 100 заказов' }
            ]},
            { id: 'RatingStar', name: 'Звезда рейтинга', levels: [
                { level: 1, requirement: 3.5, reward: 50, desc: 'Средний рейтинг 3.5' },
                { level: 2, requirement: 4.0, reward: 100, desc: 'Средний рейтинг 4.0' },
                { level: 3, requirement: 4.3, reward: 200, desc: 'Средний рейтинг 4.3' },
                { level: 4, requirement: 4.7, reward: 500, desc: 'Средний рейтинг 4.7' },
                { level: 5, requirement: 5.0, reward: 1000, desc: 'Средний рейтинг 5.0' }
            ]},
            { id: 'WorkUploader', name: 'Загрузчик работ', levels: [
                { level: 1, requirement: 5, reward: 50, desc: 'Загрузить 5 работ' },
                { level: 2, requirement: 10, reward: 100, desc: 'Загрузить 10 работ' },
                { level: 3, requirement: 20, reward: 200, desc: 'Загрузить 20 работ' },
                { level: 4, requirement: 50, reward: 500, desc: 'Загрузить 50 работ' },
                { level: 5, requirement: 100, reward: 1000, desc: 'Загрузить 100 работ' }
            ]},
            { id: 'ActiveUser', name: 'Активный пользователь', levels: [
                { level: 1, requirement: 7, reward: 50, desc: 'Активность 7 дней' },
                { level: 2, requirement: 30, reward: 100, desc: 'Активность 30 дней' },
                { level: 3, requirement: 90, reward: 200, desc: 'Активность 90 дней' },
                { level: 4, requirement: 180, reward: 500, desc: 'Активность 180 дней' },
                { level: 5, requirement: 365, reward: 1000, desc: 'Активность 365 дней' }
            ]},
            { id: 'Socialite', name: 'Социальный игрок', levels: [
                { level: 1, requirement: 5, reward: 50, desc: 'Отправить 5 сообщений' },
                { level: 2, requirement: 10, reward: 100, desc: 'Отправить 10 сообщений' },
                { level: 3, requirement: 20, reward: 200, desc: 'Отправить 20 сообщений' },
                { level: 4, requirement: 50, reward: 500, desc: 'Отправить 50 сообщений' },
                { level: 5, requirement: 100, reward: 1000, desc: 'Отправить 100 сообщений' }
            ]},
            { id: 'StyleMaster', name: 'Мастер стилей', levels: [
                { level: 1, requirement: 1, reward: 50, desc: 'Работы в 1 стиле' },
                { level: 2, requirement: 3, reward: 100, desc: 'Работы в 3 стилях' },
                { level: 3, requirement: 5, reward: 200, desc: 'Работы в 5 стилях' },
                { level: 4, requirement: 7, reward: 500, desc: 'Работы в 7 стилях' },
                { level: 5, requirement: 9, reward: 1000, desc: 'Работы во всех стилях' }
            ]},
            { id: 'ReviewKing', name: 'Король отзывов', levels: [
                { level: 1, requirement: 5, reward: 50, desc: 'Оставить 5 отзывов' },
                { level: 2, requirement: 10, reward: 100, desc: 'Оставить 10 отзывов' },
                { level: 3, requirement: 20, reward: 200, desc: 'Оставить 20 отзывов' },
                { level: 4, requirement: 50, reward: 500, desc: 'Оставить 50 отзывов' },
                { level: 5, requirement: 100, reward: 1000, desc: 'Оставить 100 отзывов' }
            ]},
            { id: 'LevelUp', name: 'Повышение уровня', levels: [
                { level: 1, requirement: 5, reward: 50, desc: 'Достичь 5 уровня' },
                { level: 2, requirement: 10, reward: 100, desc: 'Достичь 10 уровня' },
                { level: 3, requirement: 15, reward: 200, desc: 'Достичь 15 уровня' },
                { level: 4, requirement: 20, reward: 500, desc: 'Достичь 20 уровня' },
                { level: 5, requirement: 30, reward: 1000, desc: 'Достичь 30 уровня' }
            ]},
            { id: 'OrderHunter', name: 'Охотник за заказами', levels: [
                { level: 1, requirement: 3, reward: 50, desc: 'Взять 3 заказа подряд' },
                { level: 2, requirement: 5, reward: 100, desc: 'Взять 5 заказов подряд' },
                { level: 3, requirement: 10, reward: 200, desc: 'Взять 10 заказов подряд' },
                { level: 4, requirement: 15, reward: 500, desc: 'Взять 15 заказов подряд' },
                { level: 5, requirement: 20, reward: 1000, desc: 'Взять 20 заказов подряд' }
            ]},
            { id: 'PremiumUser', name: 'Премиум пользователь', levels: [
                { level: 1, requirement: 1, reward: 50, desc: 'Купить премиум 1 раз' },
                { level: 2, requirement: 3, reward: 100, desc: 'Купить премиум 3 раза' },
                { level: 3, requirement: 6, reward: 200, desc: 'Купить премиум 6 раз' },
                { level: 4, requirement: 12, reward: 500, desc: 'Купить премиум 12 раз' },
                { level: 5, requirement: 24, reward: 1000, desc: 'Купить премиум 24 раза' }
            ]}
        ];
    }

      getAchievements() {
    return this.achievements;
  }

  async awardAchievement(username, achievementId, level) {
    try {
      const achievement = this.achievements.find(a => a.id === achievementId);
      const achLevel = achievement.levels.find(l => l.level === level);
      await apiRequest(`/api/users/${encodeURIComponent(username)}/achievements`, 'PUT', { achievementId, level });
      await apiRequest(`/api/users/${encodeURIComponent(username)}/coins`, 'PUT', { amount: achLevel.reward });
      return { success: true, reward: achLevel.reward };
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return { success: false, reward: 0 };
    }
  }

  async getUserAchievements(username) {
    try {
      const user = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      return user.achievements || {};
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return {};
    }
  }

  async checkAchievements(username) {
    try {
      const user = await apiRequest(`/api/users/${encodeURIComponent(username)}`);
      const completedOrders = (user.completed_orders || []).length;
      const userWorksResult = await apiRequest(`/api/works?uploader=${encodeURIComponent(username)}`);
      const userWorks = userWorksResult.length;
      const userReviewsResult = await apiRequest(`/api/reviews?author=${encodeURIComponent(username)}`);
      const userReviews = userReviewsResult.length;
      const userMessagesResult = await apiRequest(`/api/messages/sent/${encodeURIComponent(username)}`);
      const userMessages = userMessagesResult.length;
      const userLevel = user.level || 1;
      const userStyles = new Set(userWorksResult.map(w => w.style)).size;
      const avgRating = await this.calculateAverageRating(username, user.role);

      const newAwards = [];

      for (const ach of this.achievements) {
        for (const lvl of ach.levels) {
          const achKey = `${ach.id}_L${lvl.level}`;
          if (user.achievements && user.achievements[achKey]) continue;

          let achieved = false;
          switch (ach.id) {
            case 'OrderMaster':
              achieved = completedOrders >= lvl.requirement;
              break;
            case 'RatingStar':
              achieved = avgRating >= lvl.requirement;
              break;
            case 'WorkUploader':
              achieved = userWorks >= lvl.requirement;
              break;
            case 'ActiveUser':
              achieved = (user.activeDays || 0) >= lvl.requirement; // Заглушка, нужно добавить поле в БД
              break;
            case 'Socialite':
              achieved = userMessages >= lvl.requirement;
              break;
            case 'StyleMaster':
              achieved = userStyles >= lvl.requirement;
              break;
            case 'ReviewKing':
              achieved = userReviews >= lvl.requirement;
              break;
            case 'LevelUp':
              achieved = userLevel >= lvl.requirement;
              break;
            case 'OrderHunter':
              achieved = (user.orderStreak || 0) >= lvl.requirement; // Заглушка
              break;
            case 'PremiumUser':
              achieved = (user.premiumPurchases || 0) >= lvl.requirement; // Заглушка
              break;
          }
          if (achieved) {
            const award = await this.awardAchievement(username, ach.id, lvl.level);
            if (award.success) {
              newAwards.push({ achievement: ach.name, level: lvl.level, reward: award.reward });
            }
          }
        }
      }

      return newAwards;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  async calculateAverageRating(username, role) {
    try {
      const reviews = role === 'Designer' 
        ? await apiRequest(`/api/reviews?target=${encodeURIComponent(username)}`)
        : await apiRequest(`/api/reviews?author=${encodeURIComponent(username)}`);
      return reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  }
}


