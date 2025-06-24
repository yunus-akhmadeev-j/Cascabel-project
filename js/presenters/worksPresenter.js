import { getCurrentUser } from '../common.js';

export class WorksPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

 async initialize() {
    try {
      const works = await this.model.getWorks();
      const randomWorks = await this.model.getRandomWorks(5);
      this.view.renderCarousel(randomWorks);
      this.view.renderWorks(works);
      this.view.renderShowcase(randomWorks, (index) => this.activateShowcaseItem(index));
      const uploaders = await this.model.getUniqueUploaders();
      this.view.setupUploaderFilter(uploaders);
      const recommendedDesigners = await this.model.getRecommendedDesigners('');
      console.log('Recommended Designers:', recommendedDesigners);
      this.view.renderRecommendedDesigners(recommendedDesigners);
      const user = getCurrentUser();
      if (user && user.role === 'Designer') {
        this.view.showUploadForm(() => this.uploadWork());
      } else {
        this.view.hideUploadForm();
      }
      this.view.setupSearchForm(() => this.searchWorks());
      // Добавляем настройку кнопки "Все работы"
      this.view.setupToggleWorksButton();
    } catch (error) {
      console.error('Failed to initialize works:', error);
      this.view.renderCarousel([]);
      this.view.renderWorks([]);
      this.view.renderShowcase([], (index) => this.activateShowcaseItem(index));
      this.view.setupUploaderFilter([]);
    }
  }

  async uploadWork() {
    const user = getCurrentUser();
    if (!user || user.role !== 'Designer') {
      alert('Только дизайнеры могут загружать работы.');
      return;
    }
    const data = this.view.getUploadData();
    if (data.title && data.style && data.type && (data.file || data.imageUrl)) {
      try {
        let imageSrc = data.imageUrl;
        if (data.file && !data.imageUrl) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            imageSrc = e.target.result;
            const newWork = {
              id: (await this.model.getWorks()).length + 1,
              title: data.title,
              image: imageSrc,
              style: data.style,
              type: data.type,
              uploader: user.name
            };
            await this.model.addWork(newWork);
            alert('Работа успешно загружена!');
            this.view.clearUploadForm();
            const works = await this.model.getWorks();
            this.view.renderWorks(works);
            const uploaders = await this.model.getUniqueUploaders();
            this.view.setupUploaderFilter(uploaders);
          };
          reader.readAsDataURL(data.file);
          return;
        }
        const newWork = {
          id: (await this.model.getWorks()).length + 1,
          title: data.title,
          image: imageSrc,
          style: data.style,
          type: data.type,
          uploader: user.name
        };
        await this.model.addWork(newWork);
        alert('Работа успешно загружена!');
        this.view.clearUploadForm();
        const works = await this.model.getWorks();
        this.view.renderWorks(works);
        const uploaders = await this.model.getUniqueUploaders();
        this.view.setupUploaderFilter(uploaders);
      } catch (error) {
        console.error('Error uploading work:', error);
        alert('Ошибка при загрузке работы. Попробуйте снова.');
      }
    } else {
      alert('Заполните все поля и выберите изображение или укажите ссылку.');
    }
  }

  async searchWorks() {
    try {
      const data = this.view.getSearchData();
      const filteredWorks = await this.model.getFilteredWorks(data.style, data.type, data.uploader);
      this.view.renderWorks(filteredWorks);
      const recommendedDesigners = await this.model.getRecommendedDesigners(data.style);
      this.view.renderRecommendedDesigners(recommendedDesigners);
    } catch (error) {
      console.error('Error searching works:', error);
      alert('Ошибка при поиске работ. Попробуйте снова.');
    }
  }

  activateShowcaseItem(index) {
    this.view.activateShowcaseItem(index);
  }
}