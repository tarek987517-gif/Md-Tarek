export type UserRole = 'super_admin' | 'admin' | 'editor' | 'reporter';

export type ReporterPermissions = {
  createNews: boolean;
  editOwnNews: boolean;
  deleteOwnNews: boolean;
  uploadImage: boolean;
  uploadThumbnail: boolean;
  viewOwnNews: boolean;
  publishNews: boolean;
  submitForReview: boolean;
};

export type UserPermissions = ReporterPermissions;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'disabled';
  phone?: string;
  bio?: string;
  avatar?: string;
  designation?: string;
  location?: string;
  lastLogin?: string;
  totalNews?: number;
  permissions?: ReporterPermissions;
  createdAt: string;
}

export type NewsStatus = 'published' | 'draft' | 'scheduled';

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  subcategory?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  location: string;
  content: string;
  summary: string;
  featuredImage: string;
  thumbnailImage?: string;
  imageCaption?: string;
  imageAlt?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  focusKeyword?: string;
  publishDate: string;
  publishTime: string;
  status: NewsStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  isHomepageFeatured?: boolean;
  allowComments?: boolean;
  isPopular: boolean;
  views: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  count: number;
  description?: string;
}

export interface Comment {
  id: string;
  newsId: string;
  newsTitle?: string;
  userName: string;
  userEmail: string;
  commentText: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface AdItem {
  enabled: boolean;
  code: string;
  position?: string;
  title?: string;
  type?: 'banner' | 'social_bar' | 'popunder';
  imageUrl?: string;
  link?: string;
}

export interface AdSettings {
  headerBanner: AdItem;
  homepageBanner: AdItem;
  newsDetailsBanner: AdItem;
  sidebarBanner: AdItem;
  inArticleBanner?: AdItem;
  footerBanner: AdItem;
  socialBar: AdItem;
  popunder: AdItem;
  [key: string]: AdItem | undefined;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  tagline?: string;
  editorAndPublisher: string;
  executiveEditor: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  faviconUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    twitter?: string;
    instagram?: string;
  };
  breakingNewsEnabled: boolean;
  commentsEnabled: boolean;
  themeColor: string;
  footerText: string;
  copyrightText: string;
  metaDescription: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  ip?: string;
  createdAt: string;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  status: 'preparing' | 'building' | 'deploying' | 'published' | 'failed';
  triggeredBy: string;
  triggeredByName: string;
  createdAt: string;
  completedAt?: string;
  productionUrl: string;
  commitMessage: string;
  logs: string[];
}

export interface DeploymentState {
  currentVersion: string;
  lastDeployment: string;
  status: 'idle' | 'preparing' | 'building' | 'deploying' | 'published' | 'failed';
  productionUrl: string;
  lastUpdatedBy: string;
  history: DeploymentRecord[];
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: string;
  dimensions?: string;
  uploadedBy: string;
  uploadedByName: string;
  altText?: string;
  caption?: string;
  createdAt: string;
}

export interface BackupInfo {
  date: string;
  size: string;
  version: string;
  newsCount: number;
  categoriesCount: number;
  usersCount: number;
}

export interface DeploymentInfo {
  buildCommand: string;
  publishDir: string;
  nodeVersion: string;
  spaRedirects: string;
  environmentVariables: { key: string; description: string; required: boolean }[];
  deploymentInstructions: string[];
}

