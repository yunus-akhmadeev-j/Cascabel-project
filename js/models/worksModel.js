import { apiRequest } from '../common.js';

export class WorksModel {
  constructor() {
    this.uploadedWorks = [];
    const storedWorks = localStorage.getItem('uploadedWorks');
    if (storedWorks) {
      this.uploadedWorks = JSON.parse(storedWorks);
    }
  }

  async getWorks() {
    try {
      const serverWorks = await apiRequest('/api/works');
      return [...serverWorks, ...this.uploadedWorks];
    } catch (error) {
      console.error('Error fetching works:', error);
      return this.uploadedWorks;
    }
  }

  async getFilteredWorks(style, type, uploader = '') {
    let query = '/api/works';
    let queryParams = [];
    if (style || type || uploader) {
      query += '?';
      if (style) queryParams.push(`style=${encodeURIComponent(style)}`);
      if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
      if (uploader) queryParams.push(`uploader=${encodeURIComponent(uploader)}`);
      query += queryParams.join('&');
    }
    try {
      console.log('Sending filtered request:', query);
      const serverWorks = await apiRequest(query);
      let allWorks = [...serverWorks, ...this.uploadedWorks];
      if (style) {
        allWorks = allWorks.filter(work => work.style === style); // Исправлено с = на ===
      }
      if (type) {
        allWorks = allWorks.filter(work => work.type === type); // Исправлено с = на ===
      }
      if (uploader) {
        allWorks = allWorks.filter(work => work.uploader === uploader); // Исправлено с = на ===
      }
      return allWorks;
    } catch (error) {
      console.error('Error fetching filtered works:', error);
      return [];
    }
  }

  async getRandomWorks(count) {
    try {
      const allWorks = await this.getWorks();
      const shuffled = allWorks.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error fetching random works:', error);
      return [];
    }
  }

async addWork(work) {
  try {
    // Проверяем, нет ли уже такой работы в uploadedWorks по title и uploader
    if (!this.uploadedWorks.some(w => w.title === work.title && w.uploader === work.uploader)) {
      this.uploadedWorks.push(work);
      localStorage.setItem('uploadedWorks', JSON.stringify(this.uploadedWorks));
    }
    return await apiRequest('/api/works', 'POST', work);
  } catch (error) {
    console.error('Error adding work:', error);
    throw error;
  }
}

  async getRecommendedDesigners(style = '') {
    try {
      let query = '/api/users?role=Designer';
      if (style) {
        query += `&style=${encodeURIComponent(style)}`;
      }
      const designers = await apiRequest(query);
      return designers;
    } catch (error) {
      console.error('Error fetching recommended designers:', error);
      return [];
    }
  }

  async getUniqueUploaders() {
    try {
      const allWorks = await this.getWorks();
      const uploaders = [...new Set(allWorks.map(work => work.uploader))];
      return uploaders;
    } catch (error) {
      console.error('Error fetching unique uploaders:', error);
      return [];
    }
  }
}