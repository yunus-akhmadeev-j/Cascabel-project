export class ReviewsView {
  constructor() {}

  renderReviews(reviews, onOrderClick) {
    if (!Array.isArray(reviews)) {
      console.error('Reviews is not an array:', reviews);
      const reviewsList = document.getElementById('reviewsList');
      if (reviewsList) {
        reviewsList.innerHTML = '<p>Ошибка загрузки отзывов.</p>';
      }
      return;
    }

    let html = '';
    reviews.forEach(review => {
      const stars = this.getStarsHtml(review.rating || 0);
      const orderLink = review.orderId ? `<p>Заказ: <span data-id="${review.orderId}" style="cursor: pointer; color: #ffd700;">#${review.orderId}</span></p>` : '';
      const targetInfo = review.target ? `<p>Оценка для: ${review.target}</p>` : '';
      html += `<div class="grid-item"><img src="${review.avatar}" alt="${review.author}"><h3>${review.author}</h3><p>${review.text}</p>${orderLink}${targetInfo}<div class="rating">${stars}</div><small>${review.date}</small></div>`;
    });
    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
      reviewsList.innerHTML = html;
      const orderLinks = reviewsList.querySelectorAll('span[data-id]');
      orderLinks.forEach(link => {
        const orderId = parseInt(link.getAttribute('data-id'));
        link.addEventListener('click', () => onOrderClick(orderId));
      });
    }
  }

  showReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.style.display = 'block';
    }
  }

  hideReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.style.display = 'none';
    }
  }

  getReviewText() {
    const reviewText = document.getElementById('reviewText');
    return reviewText ? reviewText.value : '';
  }

  clearReviewForm() {
    const reviewText = document.getElementById('reviewText');
    const reviewOrder = document.getElementById('reviewOrder');
    const reviewRating = document.getElementById('reviewRating');
    const reviewTarget = document.getElementById('reviewTarget');
    if (reviewText) reviewText.value = '';
    if (reviewOrder) reviewOrder.value = '';
    if (reviewRating) reviewRating.value = '0';
    if (reviewTarget) reviewTarget.value = '';
    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach(s => s.style.color = '#ccc');
  }

  setupReviewForm(orders, onSubmit) {
    const orderSelect = document.getElementById('reviewOrder');
    if (orderSelect && Array.isArray(orders)) {
      orders.forEach(orderId => {
        const option = document.createElement('option');
        option.value = orderId;
        option.textContent = `Заказ #${orderId}`;
        orderSelect.appendChild(option);
      });
    }
    const stars = document.querySelectorAll('#ratingStars .star');
    const ratingInput = document.getElementById('reviewRating');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.getAttribute('data-value'));
        if (ratingInput) ratingInput.value = value;
        stars.forEach(s => {
          s.style.color = parseInt(s.getAttribute('data-value')) <= value ? '#ffd700' : '#ccc';
        });
      });
    });
    const submitBtn = document.querySelector('#reviewForm button');
    if (submitBtn) {
      submitBtn.addEventListener('click', onSubmit);
    }
  }

  getReviewData() {
    const reviewText = document.getElementById('reviewText');
    const reviewOrder = document.getElementById('reviewOrder');
    const reviewRating = document.getElementById('reviewRating');
    const reviewTarget = document.getElementById('reviewTarget');
    return {
      text: reviewText ? reviewText.value : '',
      orderId: reviewOrder ? parseInt(reviewOrder.value) || 0 : 0,
      rating: reviewRating ? parseInt(reviewRating.value) || 0 : 0,
      target: reviewTarget ? reviewTarget.value : ''
    };
  }

  getStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating ? '<span>★</span>' : '<span style="color: #ccc;">★</span>';
    }
    return html;
  }
}