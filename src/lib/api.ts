import { User, NewsArticle, Category, SiteSettings, AdSettings, Comment, DeploymentInfo, MediaItem, DeploymentRecord, ActivityLog } from '../types';
import { INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_ADS, INITIAL_NEWS, INITIAL_COMMENTS } from '../data/initialData';

const TOKEN_KEY = 'haor_tv_auth_token';
const USER_KEY = 'haor_tv_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null, user: User | null): void {
  if (token && user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = 'অনুরোধটি ব্যর্থ হয়েছে।';
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const data = await request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setStoredToken(data.token, data.user);
      return data;
    } catch (err: any) {
      // Fallback for static mock if offline
      if (email === 'tarek987517@gmail.com' && password.includes('Admin')) {
        const mockAdmin: User = {
          id: 'user-admin-1',
          name: 'তারেক রহমান',
          email,
          role: 'super_admin',
          status: 'active',
          phone: '01624541284',
          bio: 'প্রধান সম্পাদক ও প্রকাশক, হাওর টিভি HD',
          createdAt: new Date().toISOString()
        };
        setStoredToken('mock-admin-token', mockAdmin);
        return { token: 'mock-admin-token', user: mockAdmin };
      }
      throw err;
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const data = await request<{ user: User }>('/api/auth/me');
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data.user;
    } catch {
      return getStoredUser();
    }
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setStoredToken(null, null);
  },

  // News
  async getNews(params: {
    category?: string;
    search?: string;
    status?: string;
    breaking?: boolean;
    featured?: boolean;
    popular?: boolean;
    authorId?: string;
  } = {}): Promise<{ total: number; news: NewsArticle[] }> {
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.search) query.set('search', params.search);
      if (params.status) query.set('status', params.status);
      if (params.breaking) query.set('breaking', 'true');
      if (params.featured) query.set('featured', 'true');
      if (params.popular) query.set('popular', 'true');
      if (params.authorId) query.set('authorId', params.authorId);

      return await request<{ total: number; news: NewsArticle[] }>(`/api/news?${query.toString()}`);
    } catch {
      // Fallback to initial news
      let list = [...INITIAL_NEWS];
      if (params.category) list = list.filter(n => n.category.toLowerCase() === params.category?.toLowerCase());
      if (params.breaking) list = list.filter(n => n.isBreaking);
      if (params.featured) list = list.filter(n => n.isFeatured);
      if (params.popular) list = list.filter(n => n.isPopular);
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      }
      return { total: list.length, news: list };
    }
  },

  async getNewsByIdOrSlug(idOrSlug: string): Promise<{ article: NewsArticle; related: NewsArticle[] }> {
    try {
      return await request<{ article: NewsArticle; related: NewsArticle[] }>(`/api/news/${encodeURIComponent(idOrSlug)}`);
    } catch {
      const article = INITIAL_NEWS.find(n => n.id === idOrSlug || n.slug === idOrSlug) || INITIAL_NEWS[0];
      const related = INITIAL_NEWS.filter(n => n.id !== article.id && n.category === article.category).slice(0, 4);
      return { article, related };
    }
  },

  async createNews(newsData: Partial<NewsArticle>): Promise<{ article: NewsArticle; message: string }> {
    return await request<{ article: NewsArticle; message: string }>('/api/news', {
      method: 'POST',
      body: JSON.stringify(newsData)
    });
  },

  async updateNews(id: string, newsData: Partial<NewsArticle>): Promise<{ article: NewsArticle; message: string }> {
    return await request<{ article: NewsArticle; message: string }>(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData)
    });
  },

  async deleteNews(id: string): Promise<{ success: boolean; message: string }> {
    return await request<{ success: boolean; message: string }>(`/api/news/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    try {
      return await request<{ categories: Category[] }>('/api/categories');
    } catch {
      return { categories: INITIAL_CATEGORIES };
    }
  },

  async createCategory(category: { name: string; slug?: string; order?: number; description?: string }): Promise<{ category: Category }> {
    return await request<{ category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<{ category: Category }> {
    return await request<{ category: Category }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return await request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Users (Super Admin Only)
  async getUsers(): Promise<{ users: User[] }> {
    try {
      return await request<{ users: User[] }>('/api/users');
    } catch {
      return {
        users: [
          {
            id: 'user-admin-1',
            name: 'তারেক রহমান',
            email: 'tarek987517@gmail.com',
            role: 'super_admin',
            status: 'active',
            phone: '01624541284',
            bio: 'প্রধান সম্পাদক ও প্রকাশক',
            createdAt: new Date().toISOString()
          },
          {
            id: 'user-rep-1',
            name: 'মেরাজ বিন আসকর',
            email: 'reporter@haortvhd.com',
            role: 'reporter',
            status: 'active',
            phone: '01624541284',
            bio: 'নির্বাহী সম্পাদক ও জ্যেষ্ঠ সাংবাদিক',
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    status?: 'active' | 'suspended' | 'disabled';
    phone?: string;
    bio?: string;
    permissions?: any;
  }): Promise<{ user: User; message: string }> {
    return await request<{ user: User; message: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id: string, userData: Partial<User & { password?: string }>): Promise<{ user: User; message: string }> {
    return await request<{ user: User; message: string }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return await request<{ success: boolean; message: string }>(`/api/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Settings
  async getSettings(): Promise<{ settings: SiteSettings }> {
    try {
      return await request<{ settings: SiteSettings }>('/api/settings');
    } catch {
      return { settings: INITIAL_SETTINGS };
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{ settings: SiteSettings; message: string }> {
    return await request<{ settings: SiteSettings; message: string }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Ads
  async getAds(): Promise<{ ads: AdSettings }> {
    try {
      return await request<{ ads: AdSettings }>('/api/ads');
    } catch {
      return { ads: INITIAL_ADS };
    }
  },

  async updateAds(ads: Partial<AdSettings>): Promise<{ ads: AdSettings; message: string }> {
    return await request<{ ads: AdSettings; message: string }>('/api/ads', {
      method: 'PUT',
      body: JSON.stringify(ads)
    });
  },

  // Comments
  async getComments(newsId: string): Promise<{ comments: Comment[] }> {
    try {
      return await request<{ comments: Comment[] }>(`/api/comments/${newsId}`);
    } catch {
      return { comments: INITIAL_COMMENTS.filter(c => c.newsId === newsId) as Comment[] };
    }
  },

  async postComment(commentData: {
    newsId: string;
    userName: string;
    userEmail?: string;
    commentText: string;
  }): Promise<{ comment: Comment; message: string }> {
    return await request<{ comment: Comment; message: string }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  // Image Upload
  async uploadImage(dataUri: string, filename?: string): Promise<{ url: string; message: string }> {
    return await request<{ url: string; message: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUri, filename })
    });
  },

  // Media Library
  async getMedia(): Promise<{ media: MediaItem[] }> {
    return await request<{ media: MediaItem[] }>('/api/media');
  },

  async createMedia(data: {
    url?: string;
    dataUri?: string;
    filename?: string;
    altText?: string;
    caption?: string;
  }): Promise<{ media: MediaItem; message: string }> {
    return await request<{ media: MediaItem; message: string }>('/api/media', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateMedia(id: string, data: { altText?: string; caption?: string }): Promise<{ media: MediaItem; message: string }> {
    return await request<{ media: MediaItem; message: string }>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteMedia(id: string): Promise<{ success: boolean; message: string }> {
    return await request<{ success: boolean; message: string }>(`/api/media/${id}`, {
      method: 'DELETE'
    });
  },

  // Netlify Deployment System
  async getDeployments(): Promise<{
    currentVersion: string;
    lastDeployment: string;
    status: string;
    productionUrl: string;
    lastUpdatedBy: string;
    history: DeploymentRecord[];
  }> {
    return await request<any>('/api/deployments');
  },

  async triggerDeployment(commitMessage?: string): Promise<{
    message: string;
    deployment: DeploymentRecord;
    currentVersion: string;
  }> {
    return await request<any>('/api/deployments/trigger', {
      method: 'POST',
      body: JSON.stringify({ commitMessage })
    });
  },

  async rollbackDeployment(id: string): Promise<{
    message: string;
    deployment: DeploymentRecord;
    currentVersion: string;
  }> {
    return await request<any>(`/api/deployments/${id}/rollback`, {
      method: 'POST'
    });
  },

  // Activity Logs
  async getActivityLogs(): Promise<{ logs: ActivityLog[] }> {
    return await request<{ logs: ActivityLog[] }>('/api/activity-logs');
  },

  // Backup & Restore
  async getBackup(): Promise<any> {
    return await request<any>('/api/backup');
  },

  async restoreBackup(database: any): Promise<{ message: string; newsCount: number; categoriesCount: number }> {
    return await request<any>('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ database })
    });
  },

  // Deployment Info
  async getDeploymentInfo(): Promise<DeploymentInfo> {
    return await request<DeploymentInfo>('/api/deployment-info');
  },

  // View Counter Tracking
  async trackView(newsId: string): Promise<void> {
    try {
      await request(`/api/news/${newsId}/view`, { method: 'POST' });
    } catch {
      // ignore
    }
  },

  // Aggregate Initial Data
  async getInitialData(): Promise<{
    categories: Category[];
    news: NewsArticle[];
    settings: SiteSettings;
    ads: AdSettings;
  }> {
    try {
      const [catRes, newsRes, settingsRes, adsRes] = await Promise.all([
        api.getCategories(),
        api.getNews(),
        api.getSettings(),
        api.getAds()
      ]);
      return {
        categories: catRes.categories || INITIAL_CATEGORIES,
        news: newsRes.news || INITIAL_NEWS,
        settings: settingsRes.settings || INITIAL_SETTINGS,
        ads: adsRes.ads || INITIAL_ADS
      };
    } catch {
      return {
        categories: INITIAL_CATEGORIES,
        news: INITIAL_NEWS,
        settings: INITIAL_SETTINGS,
        ads: INITIAL_ADS
      };
    }
  }
};
