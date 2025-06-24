export class WorksView {
  constructor() {
    this.currentIndex = 0;
    this.fullscreenCarousel = null;
       this.fullscreenImage = null; // Для хранения полноразмерного изображения
  }

  renderCarousel(works) {
    if (!Array.isArray(works)) {
      console.error('Works is not an array:', works);
      const carousel = document.getElementById('carousel');
      if (carousel) {
        carousel.innerHTML = '<p>Ошибка загрузки работ.</p>';
      }
      return;
    }

    let html = '';
    works.forEach((work, index) => {
      html += `<img src="${work.image}" alt="${work.title}" data-index="${index}" style="opacity: ${index === 0 ? 1 : 0};" class="${index === 0 ? 'active' : ''}">`;
    });
    const carousel = document.getElementById('carousel');
    if (carousel) {
      carousel.innerHTML = html;
      // Добавляем обработчик кликов для увеличения изображения
      const images = carousel.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('click', () => this.showFullscreenImage(img.src, img.alt));
      });
    }
  }

   renderWorks(works) {
    if (!Array.isArray(works)) {
      console.error('Works is not an array:', works);
      const worksGrid = document.getElementById('worksGrid');
      if (worksGrid) {
        worksGrid.innerHTML = '<p>Ошибка загрузки работ.</p>';
      }
      return;
    }

    let html = '';
    works.forEach(work => {
      html += `<div class="grid-item"><img src="${work.image}" alt="${work.title}" data-src="${work.image}" data-title="${work.title}"><h3>${work.title}</h3><p>Стиль: ${work.style}</p><p>Тип: ${work.type}</p><p>Автор: ${work.uploader}</p></div>`;
    });
    const worksGrid = document.getElementById('worksGrid');
    if (worksGrid) {
      worksGrid.innerHTML = html;
      // Добавляем обработчик кликов для увеличения изображения
      const images = worksGrid.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('click', () => this.showFullscreenImage(img.getAttribute('data-src'), img.getAttribute('data-title')));
      });
    }
  }

  // Метод для переключения видимости списка работ
  setupToggleWorksButton() {
    const toggleBtn = document.getElementById('toggleWorksBtn');
    const worksGrid = document.getElementById('worksGrid');
    if (toggleBtn && worksGrid) {
      toggleBtn.addEventListener('click', () => {
        if (worksGrid.style.display === 'none' || !worksGrid.style.display) {
          worksGrid.style.display = 'grid'; // Предполагается, что у grid-container есть display: grid в CSS
          toggleBtn.textContent = 'Скрыть работы';
        } else {
          worksGrid.style.display = 'none';
          toggleBtn.textContent = 'Все работы';
        }
      });
    }
  }

  renderShowcase(works, onItemClick) {
    if (!Array.isArray(works)) {
      console.error('Works is not an array:', works);
      const showcase = document.getElementById('showcase');
      if (showcase) {
        showcase.innerHTML = '<p>Ошибка загрузки работ.</p>';
      }
      return;
    }

    let html = '';
    works.forEach((work, index) => {
      html += `<div class="showcase-item ${index === 0 ? 'active' : ''}" data-index="${index}"><img src="${work.image}" alt="${work.title}"><span>${work.title}</span></div>`;
    });
    const showcase = document.getElementById('showcase');
    if (showcase) {
      showcase.innerHTML = html;
      const items = showcase.querySelectorAll('.showcase-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          const index = parseInt(item.getAttribute('data-index'));
          onItemClick(index);
        });
      });
    }
  }

  activateShowcaseItem(index) {
    const items = document.querySelectorAll('.showcase-item');
    items.forEach(item => item.classList.remove('active'));
    if (items[index]) items[index].classList.add('active');
  }

  startCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    const images = carousel.querySelectorAll('img');
    if (images.length === 0) return;
    setInterval(() => {
      images[this.currentIndex].classList.remove('active');
      this.currentIndex = (this.currentIndex + 1) % images.length;
      images[this.currentIndex].classList.add('active');
    }, 3000);
  }
  showFullscreenImage(src, alt) {
    if (this.fullscreenImage) {
      this.fullscreenImage.remove();
    }
    this.fullscreenImage = document.createElement('div');
    this.fullscreenImage.className = 'fullscreen-image';
    this.fullscreenImage.innerHTML = `<img src="${src}" alt="${alt}">
      <button>Закрыть</button>`;
    document.body.appendChild(this.fullscreenImage);
    this.fullscreenImage.style.display = 'flex';
    const closeBtn = this.fullscreenImage.querySelector('button');
    closeBtn.addEventListener('click', () => {
      this.fullscreenImage.style.display = 'none';
      this.fullscreenImage.remove();
      this.fullscreenImage = null;
    });
    // Закрытие по клику на фон
    this.fullscreenImage.addEventListener('click', (e) => {
      if (e.target === this.fullscreenImage) {
        this.fullscreenImage.style.display = 'none';
        this.fullscreenImage.remove();
        this.fullscreenImage = null;
      }
    });
  }
  showUploadForm(onUpload) {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
      uploadForm.style.display = 'block';
      const uploadBtn = uploadForm.querySelector('button');
      if (uploadBtn) {
        uploadBtn.addEventListener('click', onUpload);
      }
    }
  }

  hideUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
      uploadForm.style.display = 'none';
    }
  }

   getUploadData() {
    const fileInput = document.getElementById('uploadImage');
    const imageUrl = document.getElementById('uploadImageUrl');
    const title = document.getElementById('uploadTitle');
    const style = document.getElementById('uploadStyle');
    const type = document.getElementById('uploadType');
    return {
      file: fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null,
      imageUrl: imageUrl ? imageUrl.value : '',
      title: title ? title.value : '',
      style: style ? style.value : '',
      type: type ? type.value : ''
    };
  }

  clearUploadForm() {
    const fileInput = document.getElementById('uploadImage');
    const imageUrl = document.getElementById('uploadImageUrl');
    const title = document.getElementById('uploadTitle');
    const style = document.getElementById('uploadStyle');
    const type = document.getElementById('uploadType');
    if (fileInput) fileInput.value = '';
    if (imageUrl) imageUrl.value = '';
    if (title) title.value = '';
    if (style) style.value = '';
    if (type) type.value = '';
  }

  setupSearchForm(onSearch) {
    const searchBtn = document.querySelector('#searchForm button');
    if (searchBtn) {
      searchBtn.addEventListener('click', onSearch);
    }
  }

  getSearchData() {
    const style = document.getElementById('searchStyle');
    const type = document.getElementById('searchType');
    const uploader = document.getElementById('searchUploader');
    const minRating = document.getElementById('searchMinRating');
    return {
      style: style ? style.value : '',
      type: type ? type.value : '',
      uploader: uploader ? uploader.value : '',
      minRating: minRating && minRating.value ? parseFloat(minRating.value) : 0
    };
  }

  renderRecommendedDesigners(designers) {
    if (!Array.isArray(designers)) {
      console.error('Designers is not an array:', designers);
      const recommendedList = document.getElementById('recommendedDesignersList');
      if (recommendedList) {
        recommendedList.innerHTML = '<p>Ошибка загрузки дизайнеров.</p>';
      }
      return;
    }

    let html = '<table><tr><th>Имя</th><th>Ранг</th><th>Уровень</th><th>Работ</th><th>Рейтинг</th></tr>';
    designers.forEach(designer => {
      html += `<tr><td>${designer.name}</td><td>${designer.rank}</td><td>${designer.level}</td><td>${designer.worksCount || 0}</td><td>${designer.rating ? designer.rating.toFixed(1) : 0}/5</td></tr>`;
    });
    html += '</table>';
    const recommendedList = document.getElementById('recommendedDesignersList');
    if (recommendedList) {
      recommendedList.innerHTML = html;
    }
  }

    setupUploaderFilter(uploaders) {
    if (!Array.isArray(uploaders)) {
      console.error('Uploaders is not an array:', uploaders);
      return;
    }

    const uploaderSelect = document.getElementById('searchUploader');
    if (uploaderSelect) {
      // Очищаем существующие элементы option, кроме первого ("Все авторы")
      while (uploaderSelect.options.length > 1) {
        uploaderSelect.remove(1);
      }
      // Добавляем уникальных авторов
      uploaders.forEach(uploader => {
        const option = document.createElement('option');
        option.value = uploader;
        option.textContent = uploader;
        uploaderSelect.appendChild(option);
      });
    }
  }

  showFullscreenImage(src, alt) {
    if (this.fullscreenCarousel) {
      this.fullscreenCarousel.remove();
    }
    this.fullscreenCarousel = document.createElement('div');
    this.fullscreenCarousel.className = 'carousel-fullscreen';
    this.fullscreenCarousel.innerHTML = `<img src="${src}" alt="${alt}">
      <button style="position: absolute; top: 20px; right: 20px; background: #800000; color: #FFF8DC; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Закрыть</button>`;
    document.body.appendChild(this.fullscreenCarousel);
    this.fullscreenCarousel.style.display = 'flex';
    const closeBtn = this.fullscreenCarousel.querySelector('button');
    closeBtn.addEventListener('click', () => {
      this.fullscreenCarousel.style.display = 'none';
      this.fullscreenCarousel.remove();
      this.fullscreenCarousel = null;
    });
    // Закрытие по клику на фон
    this.fullscreenCarousel.addEventListener('click', (e) => {
      if (e.target === this.fullscreenCarousel) {
        this.fullscreenCarousel.style.display = 'none';
        this.fullscreenCarousel.remove();
        this.fullscreenCarousel = null;
      }
    });
  }
}