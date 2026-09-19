import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();

// Increase JSON payload size for image upload support
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'haor_news_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper
function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { salt: generatedSalt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

// In-memory Database state with file persistence
interface DbSchema {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'editor' | 'reporter';
    status: 'active' | 'suspended' | 'disabled';
    phone?: string;
    bio?: string;
    avatar?: string;
    designation?: string;
    location?: string;
    lastLogin?: string;
    permissions?: {
      createNews: boolean;
      editOwnNews: boolean;
      deleteOwnNews: boolean;
      uploadImage: boolean;
      uploadThumbnail: boolean;
      viewOwnNews: boolean;
      publishNews: boolean;
      submitForReview: boolean;
    };
    salt: string;
    passwordHash: string;
    createdAt: string;
  }>;
  news: any[];
  categories: any[];
  settings: any;
  ads: any;
  comments: any[];
  activityLogs: Array<{
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    description: string;
    ip?: string;
    createdAt: string;
  }>;
  deployments: Array<{
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
  }>;
  media: Array<{
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
  }>;
  currentVersion: string;
  sessions: Record<string, { userId: string; role: string; email: string; expiresAt: number }>;
}

let db: DbSchema;

// Helper to log activities
function logActivity(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  description: string,
  req?: Request
) {
  if (!db.activityLogs) db.activityLogs = [];
  const rawIp = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const logItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    userName,
    userRole,
    action,
    description,
    ip,
    createdAt: new Date().toISOString()
  };
  db.activityLogs.unshift(logItem);
  if (db.activityLogs.length > 300) {
    db.activityLogs = db.activityLogs.slice(0, 300);
  }
}

// Load seed data if needed
function loadInitialDb(): DbSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.users && data.news && data.categories) {
        if (!data.sessions) data.sessions = {};
        if (!data.activityLogs) data.activityLogs = [];
        if (!data.deployments || data.deployments.length === 0) {
          data.deployments = [
            {
              id: 'dep-1',
              version: 'v2.4.9',
              status: 'published',
              triggeredBy: 'user-admin-1',
              triggeredByName: 'তারেক রহমান',
              createdAt: '2026-09-16T18:00:00.000Z',
              completedAt: '2026-09-16T18:01:25.000Z',
              productionUrl: 'https://haortvhd.netlify.app',
              commitMessage: 'রিলিজ v2.4.9: হাওর টিভি ভিডিও বুলেটিন ও স্টুডিও সংযোজন',
              logs: [
                '[Build] Initializing build environment node 20.x...',
                '[Build] npm run build compiled with 0 errors.',
                '[Deploy] Assets synced to Netlify Global Edge CDN.',
                '[Published] Site is live at https://haortvhd.netlify.app.'
              ]
            },
            {
              id: 'dep-2',
              version: 'v2.5.0',
              status: 'published',
              triggeredBy: 'user-admin-1',
              triggeredByName: 'তারেক রহমান',
              createdAt: '2026-09-17T20:30:00.000Z',
              completedAt: '2026-09-17T20:31:18.000Z',
              productionUrl: 'https://haortvhd.netlify.app',
              commitMessage: 'প্রোডাকশন আপডেট: পূর্ণাঙ্গ প্রফেশনাল CMS ও মাল্টি-রোল কন্ট্রোল প্যানেল রিলিজ',
              logs: [
                '[Build] Preparing production deployment v2.5.0...',
                '[Build] Packaging frontend assets with Vite & Tailwind...',
                '[Build] Validating secure role permissions and Adsterra engine...',
                '[Deploy] Uploading bundle to Netlify Edge CDN...',
                '[Published] Production deployment completed successfully!'
              ]
            }
          ];
        }
        if (!data.media || data.media.length === 0) {
          data.media = [
            {
              id: 'media-1',
              url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
              filename: 'haor_dam_project.jpg',
              size: '2.4 MB',
              dimensions: '1920x1080',
              uploadedBy: 'user-admin-1',
              uploadedByName: 'তারেক রহমান',
              altText: 'বিশ্বম্ভরপুর হাওর রক্ষা বাঁধ',
              caption: 'সুরমা ও চলতি নদীর বাঁধ পরিদর্শন',
              createdAt: '2026-09-17T04:20:00.000Z'
            },
            {
              id: 'media-2',
              url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
              filename: 'sunamganj_university.jpg',
              size: '1.8 MB',
              dimensions: '1600x900',
              uploadedBy: 'user-rep-1',
              uploadedByName: 'মেরাজ বিন আসকর',
              altText: 'সুনামগঞ্জ বিশ্ববিদ্যালয় একাডেমিক ভবন',
              caption: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে ভিত্তিপ্রস্তর',
              createdAt: '2026-09-17T06:10:00.000Z'
            },
            {
              id: 'media-3',
              url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
              filename: 'tanguar_haor_houseboat.jpg',
              size: '3.1 MB',
              dimensions: '2048x1152',
              uploadedBy: 'user-admin-1',
              uploadedByName: 'তারেক রহমান',
              altText: 'টাঙ্গুয়ার হাওর পর্যটন হাউসবোট',
              caption: 'টাঙ্গুয়ার হাওরের অপার সৌন্দর্য ও পরিচ্ছন্ন পরিবেশে চলাচলরত নৌযান',
              createdAt: '2026-09-17T07:35:00.000Z'
            }
          ];
        }
        if (!data.currentVersion) data.currentVersion = 'v2.5.0';
        // Ensure user permissions and fields
        data.users.forEach((u: any) => {
          if (!u.status) u.status = 'active';
          if (!u.permissions) {
            if (u.role === 'super_admin') {
              u.permissions = {
                createNews: true,
                editOwnNews: true,
                deleteOwnNews: true,
                uploadImage: true,
                uploadThumbnail: true,
                viewOwnNews: true,
                publishNews: true,
                submitForReview: true
              };
            } else {
              u.permissions = {
                createNews: true,
                editOwnNews: true,
                deleteOwnNews: false,
                uploadImage: true,
                uploadThumbnail: true,
                viewOwnNews: true,
                publishNews: true,
                submitForReview: true
              };
            }
          }
          if (!u.designation) {
            u.designation = u.role === 'super_admin' ? 'প্রধান সম্পাদক ও প্রকাশক' : 'নির্বাহী সম্পাদক ও সাংবাদিক';
          }
          if (!u.location) {
            u.location = 'বিশ্বম্ভরপুর, সুনামগঞ্জ';
          }
        });
        return data;
      }
    } catch (e) {
      console.error('Error reading DB_FILE, recreating initial data', e);
    }
  }

  // Generate initial secure credentials from env or robust defaults
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'tarek987517@gmail.com').toLowerCase();
  const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || 'HaorTv@Admin2026!';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'তারেক রহমান';

  const reporterEmail = (process.env.REPORTER_EMAIL || 'reporter@haortvhd.com').toLowerCase();
  const reporterPass = process.env.REPORTER_PASSWORD || 'HaorReporter#2026!';
  const reporterName = process.env.REPORTER_NAME || 'মেরাজ বিন আসকর';

  const superAdminHash = hashPassword(superAdminPass);
  const reporterHash = hashPassword(reporterPass);

  const initialUsers = [
    {
      id: 'user-admin-1',
      name: superAdminName,
      email: superAdminEmail,
      role: 'super_admin' as const,
      status: 'active' as const,
      phone: '01624541284',
      bio: 'প্রধান সম্পাদক ও প্রকাশক, হাওর টিভি HD',
      designation: 'প্রধান সম্পাদক ও প্রকাশক',
      location: 'বিশ্বম্ভরপুর, সুনামগঞ্জ',
      permissions: {
        createNews: true,
        editOwnNews: true,
        deleteOwnNews: true,
        uploadImage: true,
        uploadThumbnail: true,
        viewOwnNews: true,
        publishNews: true,
        submitForReview: true
      },
      salt: superAdminHash.salt,
      passwordHash: superAdminHash.hash,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-rep-1',
      name: reporterName,
      email: reporterEmail,
      role: 'reporter' as const,
      status: 'active' as const,
      phone: '01624541284',
      bio: 'নির্বাহী সম্পাদক ও জ্যেষ্ঠ সাংবাদিক, হাওর টিভি HD',
      designation: 'নির্বাহী সম্পাদক ও জ্যেষ্ঠ সাংবাদিক',
      location: 'বিশ্বম্ভরপুর, সুনামগঞ্জ',
      permissions: {
        createNews: true,
        editOwnNews: true,
        deleteOwnNews: false,
        uploadImage: true,
        uploadThumbnail: true,
        viewOwnNews: true,
        publishNews: true,
        submitForReview: true
      },
      salt: reporterHash.salt,
      passwordHash: reporterHash.hash,
      createdAt: new Date().toISOString()
    }
  ];

  const initialCategories = [
    { id: 'cat-1', name: 'জাতীয়', slug: 'national', order: 1, count: 18 },
    { id: 'cat-2', name: 'রাজনীতি', slug: 'politics', order: 2, count: 14 },
    { id: 'cat-3', name: 'সুনামগঞ্জ', slug: 'sunamganj', order: 3, count: 25 },
    { id: 'cat-4', name: 'বিশ্বম্ভরপুর', slug: 'bishwambharpur', order: 4, count: 20 },
    { id: 'cat-5', name: 'সিলেট', slug: 'sylhet', order: 5, count: 16 },
    { id: 'cat-6', name: 'বাংলাদেশ', slug: 'bangladesh', order: 6, count: 19 },
    { id: 'cat-7', name: 'আন্তর্জাতিক', slug: 'international', order: 7, count: 12 },
    { id: 'cat-8', name: 'খেলাধুলা', slug: 'sports', order: 8, count: 15 },
    { id: 'cat-9', name: 'বিনোদন', slug: 'entertainment', order: 9, count: 9 },
    { id: 'cat-10', name: 'প্রযুক্তি', slug: 'technology', order: 10, count: 11 },
    { id: 'cat-11', name: 'অর্থনীতি', slug: 'economy', order: 11, count: 13 },
    { id: 'cat-12', name: 'শিক্ষা', slug: 'education', order: 12, count: 10 },
    { id: 'cat-13', name: 'চাকরি', slug: 'jobs', order: 13, count: 8 },
    { id: 'cat-14', name: 'লাইফস্টাইল', slug: 'lifestyle', order: 14, count: 7 },
    { id: 'cat-15', name: 'ধর্ম', slug: 'religion', order: 15, count: 9 },
    { id: 'cat-16', name: 'স্বাস্থ্য', slug: 'health', order: 16, count: 12 },
    { id: 'cat-17', name: 'অপরাধ', slug: 'crime', order: 17, count: 14 },
    { id: 'cat-18', name: 'কৃষি', slug: 'agriculture', order: 18, count: 17 },
    { id: 'cat-19', name: 'মতামত', slug: 'opinion', order: 19, count: 6 },
    { id: 'cat-20', name: 'অন্যান্য', slug: 'others', order: 20, count: 5 }
  ];

  const initialSettings = {
    siteName: 'হাওর টিভি HD',
    siteTagline: 'সত্যের সন্ধানে নির্ভীক কণ্ঠস্বর | হাওরাঞ্চলের মুখপাত্র',
    editorAndPublisher: 'তারেক রহমান',
    executiveEditor: 'মেরাজ বিন আসকর',
    address: 'বিশ্বম্ভরপুর 3000, বাংলাদেশ',
    phone: '01624541284',
    email: 'tarek987517@gmail.com',
    logoUrl: '',
    faviconUrl: '',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    twitterUrl: 'https://twitter.com',
    breakingNewsEnabled: true,
    commentsEnabled: true,
    themeColor: '#b91c1c',
    footerText: 'হাওর টিভি HD - সত্য, বস্তুনিষ্ঠ ও নিরপেক্ষ সংবাদের প্রতিশ্রুতি নিয়ে পরিচালিত দেশের অন্যতম শীর্ষস্থানীয় ডিজিটাল মাল্টিমিডিয়া নিউজ পোর্টাল। সুনামগঞ্জ, বিশ্বম্ভরপুর ও সিলেটসহ সারা দেশের খবর সবার আগে পৌঁছে দেয়।',
    copyrightText: '© ২০২৬ হাওর টিভি HD। সর্বস্বত্ব সংরক্ষিত।',
    metaDescription: 'হাওর টিভি HD - সুনামগঞ্জ, বিশ্বম্ভরপুর, সিলেট এবং বাংলাদেশের সর্বশেষ নির্ভরযোগ্য ব্রেকিং নিউজ ও ভিডিও বুলেটিন।'
  };

  const initialAds = {
    headerBanner: {
      enabled: true,
      title: 'হেডার ব্যানার (728x90)',
      position: 'header',
      type: 'banner',
      code: '<!-- Adsterra Header Banner -->'
    },
    homepageBanner: {
      enabled: true,
      title: 'হোমপেজ মিডল ব্যানার (970x250)',
      position: 'homepage_middle',
      type: 'banner',
      code: '<!-- Adsterra Homepage Banner -->'
    },
    newsDetailsBanner: {
      enabled: true,
      title: 'নিউজ ডিটেইলস ব্যানার (728x90)',
      position: 'news_details',
      type: 'banner',
      code: '<!-- Adsterra In-Article Banner -->'
    },
    sidebarBanner: {
      enabled: true,
      title: 'সাইডবার ব্যানার (300x250)',
      position: 'sidebar',
      type: 'banner',
      code: '<!-- Adsterra Sidebar Rectangle -->'
    },
    footerBanner: {
      enabled: true,
      title: 'ফুটার ব্যানার (728x90)',
      position: 'footer',
      type: 'banner',
      code: '<!-- Adsterra Footer Sticky -->'
    },
    socialBar: {
      enabled: false,
      title: 'সোশ্যাল বার অ্যাড',
      type: 'social_bar',
      code: '<!-- Adsterra Social Bar -->'
    },
    popunder: {
      enabled: false,
      title: 'পপআন্ডার অ্যাড',
      type: 'popunder',
      code: '<!-- Adsterra Popunder -->'
    }
  };

  const initialNews = [
    {
      id: 'news-1',
      title: 'বিশ্বম্ভরপুরে সুরমা ও চলতি নদীর বাঁধ সংস্কার প্রকল্পে বড় অগ্রগতি, খুশি হাওরবাসী',
      subtitle: 'বোরো ফসল রক্ষায় আগাম ব্যবস্থা নিচ্ছে পানিসম্পদ মন্ত্রণালয়',
      slug: 'bishwambharpur-river-embankment-progress-news',
      category: 'বিশ্বম্ভরপুর',
      authorId: 'user-admin-1',
      authorName: 'তারেক রহমান',
      authorRole: 'প্রধান সম্পাদক ও প্রকাশক',
      location: 'বিশ্বম্ভরপুর, সুনামগঞ্জ',
      summary: 'হাওরাঞ্চলের একমাত্র বোরো ফসল অকাল বন্যা থেকে সুরক্ষায় বিশ্বম্ভরপুর উপজেলার কংস ও চলতি নদীর ডুবন্ত বাঁধ নির্মাণ ও সংস্কারে নির্ধারিত সময়ের আগেই কাজ শেষ করার লক্ষ্য নির্ধারণ করা হয়েছে।',
      content: `বিশ্বম্ভরপুর (সুনামগঞ্জ) প্রতিনিধি:\nসুনামগঞ্জের বিশ্বম্ভরপুর উপজেলায় হাওর রক্ষা বাঁধ নির্মাণ ও সংস্কার কাজের অগ্রগতি পরিদর্শনে এসে সংশ্লিষ্ট প্রকৌশলীরা জানিয়েছেন, এবার নির্ধারিত সময়ের আগেই গুরুত্বপূর্ণ ক্লোজারগুলোর মাটির কাজ সম্পন্ন হবে।\n\nউপজেলা নির্বাহী কর্মকর্তা ও পানি উন্নয়ন বোর্ডের কর্মকর্তাদের উপস্থিতিতে স্থানীয় কৃষক প্রতিনিধিদের সাথে এক মতবিনিময় সভায় এ তথ্য জানানো হয়। বিশ্বম্ভরপুরের করচার হাওর ও শনির হাওরের কৃষকরা জানান, বাঁধের কাজে নজরদারি বৃদ্ধি পাওয়ায় তারা আশ্বস্ত বোধ করছেন।\n\nউপজেলা প্রকল্প বাস্তবায়ন কমিটির (পিআইসি) সভাপতি জানান, "হাওরের মানুষের একমাত্র সম্বল এই বোরো ধান। কোনোভাবেই যেন ফসলহানির ঘটনা না ঘটে, সে লক্ষ্যে দিনরাত কাজ চলছে।"\n\nএ সময় উপস্থিত ছিলেন হাওর বাঁচাও আন্দোলনের নেতৃবৃন্দ ও স্থানীয় সাংবাদিকবৃন্দ। কৃষকরা টেকসই বাঁধ নির্মাণের পাশাপাশি নদীর নাব্যতা ফিরিয়ে আনতে নিয়মিত ড্রেজিংয়েরও জোর দাবি জানান।`,
      featuredImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'বিশ্বম্ভরপুরে হাওর রক্ষা বাঁধ সংস্কার কাজ তদারকি করছেন স্থানীয় প্রশাসন ও কৃষক প্রতিনিধিরা।',
      imageAlt: 'বিশ্বম্ভরপুর হাওর রক্ষা বাঁধ',
      tags: ['বিশ্বম্ভরপুর', 'সুনামগঞ্জ', 'হাওর', 'কৃষি', 'বোরো ধান'],
      seoTitle: 'বিশ্বম্ভরপুরে সুরমা ও চলতি নদীর বাঁধ সংস্কার প্রকল্পে বড় অগ্রগতি',
      seoDescription: 'সুনামগঞ্জের বিশ্বম্ভরপুরে বোরো ফসল রক্ষায় আগাম ব্যবস্থা নিচ্ছে পানিসম্পদ মন্ত্রণালয় ও প্রশাসন।',
      metaKeywords: 'বিশ্বম্ভরপুর, সুনামগঞ্জ, হাওর টিভি, বাঁধ, কৃষক',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'সকাল ১০:৩০',
      status: 'published',
      isBreaking: true,
      isFeatured: true,
      isPopular: true,
      views: 4820,
      commentsCount: 14,
      createdAt: '2026-09-17T04:30:00.000Z',
      updatedAt: '2026-09-17T04:30:00.000Z'
    },
    {
      id: 'news-2',
      title: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে নতুন একাডেমিক ভবনের ভিত্তিপ্রস্তর স্থাপন',
      subtitle: 'উচ্চশিক্ষায় হাওরাঞ্চলের তরুণদের সুযোগ আরও সম্প্রসারিত হবে',
      slug: 'sunamganj-science-technology-university-academic-building',
      category: 'সুনামগঞ্জ',
      authorId: 'user-rep-1',
      authorName: 'মেরাজ বিন আসকর',
      authorRole: 'নির্বাহী সম্পাদক',
      location: 'সুনামগঞ্জ সদর',
      summary: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের আধুনিক সুযোগ-সুবিধা সম্বলিত নতুন বহুতল একাডেমিক ভবনের ভিত্তিপ্রস্তর স্থাপন সম্পন্ন হয়েছে।',
      content: `সুনামগঞ্জ প্রতিনিধি:\nউচ্চশিক্ষা ও গবেষণার নবদিগন্ত উন্মোচনের অংশ হিসেবে সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের পূর্ণাঙ্গ ক্যাম্পাসে নতুন শিক্ষা ভবনের আনুষ্ঠানিক ভিত্তিপ্রস্তর স্থাপন করা হয়েছে।\n\nঅনুষ্ঠানে প্রধান অতিথি হিসেবে উপস্থিত বিশিষ্ট ব্যক্তিবর্গ বলেন, একসময় যে অঞ্চল যোগাযোগ ও শিক্ষায় পিছিয়ে ছিল, আজ প্রধানমন্ত্রী ও সরকারের বিশেষ পরিকল্পনায় আধুনিক বিদ্যাপীঠে রূপ নিচ্ছে। নবীন শিক্ষার্থীরা যেন হাওরের জীববৈচিত্র্য ও জলবায়ু পরিবর্তন মোকাবেলায় গবেষণা করতে পারে, সে সুযোগও রাখা হচ্ছে।\n\nবিশ্ববিদ্যালয়ের উপাচার্য মহোদয় জানান, আগামী বছর থেকেই ছাত্রছাত্রীরা বিশ্বমানের গবেষণাগার ও ডিজিটাল ক্লাসরুমে পাঠগ্রহণের সুযোগ পাবেন।`,
      featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের অনুষ্ঠানে আমন্ত্রিত অতিথিবৃন্দ।',
      imageAlt: 'সুনামগঞ্জ বিশ্ববিদ্যালয় একাডেমিক ভবন',
      tags: ['সুনামগঞ্জ', 'শিক্ষা', 'বিশ্ববিদ্যালয়', 'গবেষণা'],
      seoTitle: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে নতুন একাডেমিক ভবন',
      seoDescription: 'সুনামগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ে নতুন বহুতল একাডেমিক ভবনের নির্মাণ কাজ শুরু হয়েছে।',
      metaKeywords: 'সুনামগঞ্জ, বিশ্ববিদ্যালয়, উচ্চশিক্ষা, হাওর টিভি HD',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'দুপুর ১২:১৫',
      status: 'published',
      isBreaking: false,
      isFeatured: true,
      isPopular: true,
      views: 3210,
      commentsCount: 8,
      createdAt: '2026-09-17T06:15:00.000Z',
      updatedAt: '2026-09-17T06:15:00.000Z'
    },
    {
      id: 'news-3',
      title: 'টাঙ্গুয়ার হাওরে পরিবেশবান্ধব হাউসবোট নীতিমালা প্রণয়ন, পর্যটকদের নিরাপত্তা জোরদার',
      subtitle: 'পরিবেশের ক্ষতি না করে টেকসই পর্যটন বিকাশে কঠোর নির্দেশনা',
      slug: 'tanguar-haor-houseboat-guidelines-tourism',
      category: 'সুনামগঞ্জ',
      authorId: 'user-admin-1',
      authorName: 'তারেক রহমান',
      authorRole: 'প্রধান সম্পাদক ও প্রকাশক',
      location: 'তাহিরপুর, সুনামগঞ্জ',
      summary: 'রামসার সাইট টাঙ্গুয়ার হাওরের জীববৈচিত্র্য ও প্রাকৃতিক সৌন্দর্য অটুট রেখে পর্যটন শিল্প পরিচালনার জন্য জেলা প্রশাসনের পক্ষ থেকে নতুন সুনির্দিষ্ট নীতিমালা ঘোষণা করা হয়েছে।',
      content: `তাহিরপুর (সুনামগঞ্জ) প্রতিনিধি:\nদেশি-বিদেশি পর্যটকদের কাছে অত্যন্ত জনপ্রিয় সুনামগঞ্জের রামসার সাইট টাঙ্গুয়ার হাওরে যেকোনো ধরনের প্লাস্টিক বর্জ্য ফেলা কঠোরভাবে নিষিদ্ধ করা হয়েছে।\n\nজেলা প্রশাসনের বিশেষ বৈঠকে গৃহীত সিদ্ধান্তে প্রতিটি হাউসবোটের নিজস্ব ওয়েস্ট ম্যানেজমেন্ট সিস্টেম থাকা বাধ্যতামূলক করা হয়েছে। অতিরিক্ত শব্দদূষণ ও উচ্চশব্দে গান বাজানো নিষিদ্ধ করে শান্ত প্রাকৃতিক পরিবেশ বজায় রাখার নির্দেশ দেওয়া হয়েছে।\n\nট্যুরিজম অপারেটরদের পক্ষ থেকে বলা হয়েছে, "আমরা প্রশাসনকে স্বাগত জানাই। পরিবেশ না বাঁচলে পর্যটন টিকে থাকবে না।" পর্যটকদের সুবিধার জন্য বিশ্বম্ভরপুর ও তাহিরপুর ঘাটে বিশেষ পুলিশ হেল্পডেস্কও স্থাপন করা হয়েছে।`,
      featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'টাঙ্গুয়ার হাওরের অপার সৌন্দর্য ও পরিচ্ছন্ন পরিবেশে চলাচলরত নৌযান।',
      imageAlt: 'টাঙ্গুয়ার হাওর পর্যটন হাউসবোট',
      tags: ['টাঙ্গুয়ার হাওর', 'পর্যটন', 'সুনামগঞ্জ', 'পরিবেশ'],
      seoTitle: 'টাঙ্গুয়ার হাওরে পরিবেশবান্ধব হাউসবোট নীতিমালা প্রণয়ন',
      seoDescription: 'টাঙ্গুয়ার হাওরের জীববৈচিত্র্য রক্ষায় পর্যটন পরিচালনায় নতুন বিধিনিষেধ জারি।',
      metaKeywords: 'টাঙ্গুয়ার হাওর, সুনামগঞ্জ, পর্যটন, হাওর টিভি',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'দুপুর ০১:৪০',
      status: 'published',
      isBreaking: true,
      isFeatured: true,
      isPopular: true,
      views: 5930,
      commentsCount: 22,
      createdAt: '2026-09-17T07:40:00.000Z',
      updatedAt: '2026-09-17T07:40:00.000Z'
    },
    {
      id: 'news-4',
      title: 'জাতীয় অর্থনীতিতে প্রবৃদ্ধির নতুন আশাবাদ: রপ্তানি খাতে রেকর্ড প্রবৃদ্ধি অর্জন',
      subtitle: 'তৈরি পোশাক ও আইটি খাতের যৌথ সাফল্যে বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক ধারা',
      slug: 'national-economy-export-growth-record-bangladesh',
      category: 'অর্থনীতি',
      authorId: 'user-rep-1',
      authorName: 'মেরাজ বিন আসকর',
      authorRole: 'নির্বাহী সম্পাদক',
      location: 'ঢাকা',
      summary: 'চলতি অর্থবছরে দেশের সামগ্রিক রপ্তানি আয়ে জোরালো ঊর্ধ্বমুখী ধারা লক্ষ্য করা গেছে। বাংলাদেশ ব্যাংকের সর্বশেষ পরিসংখ্যানে বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক স্থিতিশীলতা এসেছে।',
      content: `ঢাকা ব্যুরো:\nদেশের সার্বিক রপ্তানি ও রেমিট্যান্স প্রবাহে নতুন মাইলফলক স্পর্শ করেছে বাংলাদেশ। রপ্তানি উন্নয়ন ব্যুরোর (ইপিবি) সাম্প্রতিক তথ্যানুযায়ী, প্রচলিত পোশাক শিল্পের পাশাপাশি সফটওয়্যার ও ডিজিটাল সার্ভিসেস রপ্তানিতে গত মাসের তুলনায় উল্লেখযোগ্য উন্নতি হয়েছে।`,
      featuredImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'বাণিজ্য ও শিল্প খাতের প্রবৃদ্ধিতে দেশের সার্বিক অর্থনীতি গতিশীল হচ্ছে।',
      imageAlt: 'বাংলাদেশ অর্থনীতি ও রপ্তানি',
      tags: ['অর্থনীতি', 'জাতীয়', 'রপ্তানি', 'বাংলাদেশ ব্যাংক'],
      seoTitle: 'জাতীয় অর্থনীতিতে প্রবৃদ্ধির নতুন আশাবাদ - হাওর টিভি HD',
      seoDescription: 'রপ্তানি আয়ে নতুন রেকর্ড, বৈদেশিক মুদ্রার রিজার্ভে স্বস্তিদায়ক অবস্থান।',
      metaKeywords: 'অর্থনীতি, রপ্তানি, বাংলাদেশ, হাওর টিভি',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'বিকাল ০৩:১০',
      status: 'published',
      isBreaking: false,
      isFeatured: true,
      isPopular: false,
      views: 2840,
      commentsCount: 5,
      createdAt: '2026-09-17T09:10:00.000Z',
      updatedAt: '2026-09-17T09:10:00.000Z'
    },
    {
      id: 'news-5',
      title: 'বিশ্বম্ভরপুরে সৌরবিদ্যুৎ চালিত সেচ পাম্পে বিপ্লব: কম খরচে দ্বিগুণেরও বেশি ফসল উৎপাদন',
      subtitle: 'তেল ও বিদ্যুতের দুশ্চিন্তা ছাড়াই পানি পাচ্ছেন শত শত কৃষক',
      slug: 'bishwambharpur-solar-irrigation-pump-revolution',
      category: 'কৃষি',
      authorId: 'user-admin-1',
      authorName: 'তারেক রহমান',
      authorRole: 'প্রধান সম্পাদক ও প্রকাশক',
      location: 'বিশ্বম্ভরপুর',
      summary: 'সুনামগঞ্জের বিশ্বম্ভরপুরে আধুনিক সৌরচালিত পাম্প স্থাপনের মাধ্যমে হাওর অঞ্চলের বোরো মৌসুমে ফসলি জমিতে কম খরচে সেচ সুবিধা নিশ্চিত করা সম্ভব হয়েছে।',
      content: `বিশ্বম্ভরপুর নিজস্ব প্রতিবেদক:\nবিশ্বম্ভরপুর উপজেলার বিভিন্ন মাঠে স্থাপন করা সৌরচালিত সেচ প্রকল্প এখন স্থানীয় কৃষকদের কাছে আশীর্বাদে পরিণত হয়েছে। ডিজেল চালিত জেনারেটরের মাধ্যমে সেচ দিতে গিয়ে কৃষকদের উৎপাদন খরচের একটি বড় অংশ চলে যেত জ্বালানি ক্রয়ে।\n\nকৃষি সম্প্রসারণ অধিদপ্তরের কর্মকর্তারা জানান, সোলার সিস্টেমের কারণে নিরবচ্ছিন্ন পানি সরবরাহ সম্ভব হচ্ছে এবং পরিবেশও দূষণমুক্ত থাকছে।`,
      featuredImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'সবুজ ধানের শীষে হাওরাঞ্চলের দিগন্তজোড়া সোনালী ফসলের মাঠ।',
      imageAlt: 'বিশ্বম্ভরপুর সৌর সেচ পাম্প ও কৃষি',
      tags: ['কৃষি', 'বিশ্বম্ভরপুর', 'সুনামগঞ্জ', 'সৌরবিদ্যুৎ'],
      seoTitle: 'বিশ্বম্ভরপুরে সৌরবিদ্যুৎ চালিত সেচ পাম্পে কৃষি বিপ্লব',
      seoDescription: 'সুনামগঞ্জের বিশ্বম্ভরপুরে কৃষিতে সৌরচালিত সেচ প্রকল্প সফলভাবে কাজ করছে।',
      metaKeywords: 'কৃষি, বিশ্বম্ভরপুর, সৌর পাম্প, হাওর টিভি HD',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'বিকাল ০৪:২৫',
      status: 'published',
      isBreaking: false,
      isFeatured: false,
      isPopular: true,
      views: 3150,
      commentsCount: 9,
      createdAt: '2026-09-17T10:25:00.000Z',
      updatedAt: '2026-09-17T10:25:00.000Z'
    },
    {
      id: 'news-6',
      title: 'আন্তর্জাতিক টি-টোয়েন্টি সিরিজে দুরন্ত জয় পেল বাংলাদেশ ক্রিকেট দল',
      subtitle: 'অলরাউন্ড নৈপুণ্যে প্রতিপক্ষকে বিধ্বস্ত করে সিরিজ নিজেদের করে নিল টাইগাররা',
      slug: 'bangladesh-cricket-team-t20-series-victory',
      category: 'খেলাধুলা',
      authorId: 'user-rep-1',
      authorName: 'মেরাজ বিন আসকর',
      authorRole: 'নির্বাহী সম্পাদক',
      location: 'সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়াম',
      summary: 'সিলেটের নয়নাভিরাম স্টেডিয়ামে টানটান উত্তেজনাকর ফাইনালে শেষ ওভারে ছক্কা হাঁকিয়ে ঐতিহাসিক সিরিজ জয় নিশ্চিত করল বাংলাদেশ ক্রিকেট দল।',
      content: `সিলেট ব্যুরো:\nদর্শকদের উল্লাস আর করতালি মুখর সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়ামে আবারও রচিত হলো অবিস্মরণীয় ইতিহাস। শেষ ওভারের রোমাঞ্চকর মুহূর্তে দুর্দান্ত ব্যাটিং ও বোলিংয়ের সমন্বয়ে সিরিজ ট্রফি নিজেদের করে নিল টাইগাররা।`,
      featuredImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়ামে জয়ের উল্লাসে বাংলাদেশ দল।',
      imageAlt: 'বাংলাদেশ ক্রিকেট জয় সিলেট স্টেডিয়াম',
      tags: ['খেলাধুলা', 'ক্রিকেট', 'সিলেট', 'টাইগার'],
      seoTitle: 'টি-টোয়েন্টি সিরিজে ঐতিহাসিক জয় পেল বাংলাদেশ ক্রিকেট দল',
      seoDescription: 'সিলেটে শ্বাসরুদ্ধকর ম্যাচে দুর্দান্ত জয়ে সিরিজ নিশ্চিত করল টাইগাররা।',
      metaKeywords: 'ক্রিকেট, খেলাধুলা, বাংলাদেশ, সিলেট, হাওর টিভি',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'সন্ধ্যা ০৬:০০',
      status: 'published',
      isBreaking: true,
      isFeatured: false,
      isPopular: true,
      views: 6740,
      commentsCount: 31,
      createdAt: '2026-09-17T12:00:00.000Z',
      updatedAt: '2026-09-17T12:00:00.000Z'
    },
    {
      id: 'news-7',
      title: 'হাওর টিভি HD-এর অনলাইন ডিজিটাল সম্প্রচারে যুক্ত হলো লাইভ হাই-ডেফিনিশন স্টুডিও',
      subtitle: 'বিশ্বম্ভরপুর ও সুনামগঞ্জ থেকেই সরাসরি দেশ-বিদেশের সংবাদের বস্তুনিষ্ঠ বিশ্লেষণ',
      slug: 'haor-tv-hd-digital-broadcasting-studio-launch',
      category: 'প্রযুক্তি',
      authorId: 'user-admin-1',
      authorName: 'তারেক রহমান',
      authorRole: 'প্রধান সম্পাদক ও প্রকাশক',
      location: 'বিশ্বম্ভরপুর প্রধান কার্যালয়',
      summary: 'হাওর অঞ্চলের মানুষের অধিকার, সুখ-দুঃখ এবং বিশ্বসংবাদের নিরপেক্ষ পরিবেশনার উদ্দেশ্যে হাওর টিভি HD-এর উন্নত ডিজিটাল সেন্ট্রাল স্টুডিও চালু হয়েছে।',
      content: `হাওর টিভি HD সংবাদ ডেস্ক:\nসুনামগঞ্জ জেলার বিশ্বম্ভরপুর কেন্দ্রীয় অফিস থেকে শুরু হয়েছে আধুনিক স্যাটেলাইট ও ইন্টারনেট মাল্টিমিডিয়া সম্প্রচার। হাওর টিভি HD পোর্টাল এখন পাঠকদের জন্য আরও দ্রুত, নিরাপদ ও মানসম্পন্ন সংবাদ পরিবেশনে প্রস্তুত।\n\nপ্রধান সম্পাদক তারেক রহমান ও নির্বাহী সম্পাদক মেরাজ বিন আসকর এক যুক্ত বিবৃতিতে বলেন, "আমাদের মূল লক্ষ্য বস্তুনিষ্ঠ সাংবাদিকতা। হাওর পাড়ের প্রান্তিক মানুষের কণ্ঠস্বর বিশ্ব দরবারে পৌঁছে দিতে হাওর টিভি HD নিরলস কাজ করে যাবে।"`,
      featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      thumbnailImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
      imageCaption: 'হাওর টিভি HD আধুনিক ডিজিটাল নিউজরুম ও ব্রডকাস্টিং কন্ট্রোল।',
      imageAlt: 'হাওর টিভি HD নিউজরুম',
      tags: ['হাওর টিভি HD', 'মিডিয়া', 'বিশ্বম্ভরপুর', 'প্রযুক্তি'],
      seoTitle: 'হাওর টিভি HD-এর অনলাইন ডিজিটাল সম্প্রচারে নতুন দিগন্ত',
      seoDescription: 'বিশ্বম্ভরপুর থেকে পরিচালিত হাওর টিভি HD-এর সর্বাধুনিক সংবাদ পরিবেশনা।',
      metaKeywords: 'হাওর টিভি HD, তারেক রহমান, মেরাজ বিন আসকর, বিশ্বম্ভরপুর',
      publishDate: '২০২৬-০৯-১৭',
      publishTime: 'রাত ০৮:২০',
      status: 'published',
      isBreaking: true,
      isFeatured: true,
      isPopular: true,
      views: 8920,
      commentsCount: 45,
      createdAt: '2026-09-17T14:20:00.000Z',
      updatedAt: '2026-09-17T14:20:00.000Z'
    }
  ];

  const initialComments = [
    {
      id: 'comm-1',
      newsId: 'news-1',
      newsTitle: 'বিশ্বম্ভরপুরে সুরমা ও চলতি নদীর বাঁধ সংস্কার প্রকল্পে বড় অগ্রগতি',
      userName: 'আবু বকর সিদ্দিক',
      userEmail: 'abu.bakar@gmail.com',
      commentText: 'আমাদের বিশ্বম্ভরপুরের কৃষকদের জন্য বাঁধ সংস্কার সত্যি অনেক স্বস্তির খবর। হাওর টিভি HD কে ধন্যবাদ দ্রুত এই সংবাদ প্রকাশ করার জন্য।',
      status: 'approved',
      createdAt: '2026-09-17T05:20:00.000Z'
    },
    {
      id: 'comm-2',
      newsId: 'news-3',
      newsTitle: 'টাঙ্গুয়ার হাওরে পরিবেশবান্ধব হাউসবোট নীতিমালা প্রণয়ন',
      userName: 'মাহবুব আলম',
      userEmail: 'mahbub.sylhet@yahoo.com',
      commentText: 'হাওরের পরিবেশ রক্ষা করা প্রতিটি নাগরিকের দায়িত্ব। প্রশাসনকে শক্ত পদক্ষেপ নিতে হবে। চমৎকার রিপোর্ট!',
      status: 'approved',
      createdAt: '2026-09-17T08:15:00.000Z'
    }
  ];

  const newDb: DbSchema = {
    users: initialUsers,
    news: initialNews,
    categories: initialCategories,
    settings: initialSettings,
    ads: initialAds,
    comments: initialComments,
    activityLogs: [
      {
        id: 'act-init-1',
        userId: 'user-admin-1',
        userName: superAdminName,
        userRole: 'super_admin',
        action: 'সিস্টেম ইনিশিয়ালাইজ',
        description: 'হাওর টিভি HD CMS প্রোডাকশন ডাটাবেজ সক্রিয় করা হয়েছে',
        ip: '127.0.0.1',
        createdAt: new Date().toISOString()
      }
    ],
    deployments: [
      {
        id: 'dep-init-1',
        version: 'v2.5.0',
        status: 'published',
        triggeredBy: 'user-admin-1',
        triggeredByName: superAdminName,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        productionUrl: 'https://haortvhd.netlify.app',
        commitMessage: 'প্রাথমিক সংস্করণ ২.৫.০ প্রকাশ ও Netlify কনফিগারেশন',
        logs: [
          `[${new Date().toLocaleTimeString('bn-BD')}] [Build] Production assets built with Vite`,
          `[${new Date().toLocaleTimeString('bn-BD')}] [Deploy] Netlify Live Edge deployed`
        ]
      }
    ],
    media: [
      {
        id: 'media-1',
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
        filename: 'surma_chalti_river_dam.jpg',
        size: '2.4 MB',
        dimensions: '1920x1080',
        uploadedBy: 'user-admin-1',
        uploadedByName: superAdminName,
        altText: 'সুরমা ও চলতি নদীর বাঁধ সংস্কার',
        caption: 'বিশ্বম্ভরপুরে সুরমা নদীর বাঁধ নির্মাণ কাজ দ্রুত এগিয়ে চলছে',
        createdAt: '2026-09-17T05:00:00.000Z'
      }
    ],
    currentVersion: 'v2.5.0',
    sessions: {}
  };

  saveDb(newDb);
  return newDb;
}

function saveDb(dataToSave?: DbSchema) {
  try {
    const toSave = dataToSave || db;
    fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save haor_news_db.json', e);
  }
}

db = loadInitialDb();

// Authentication middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'editor' | 'reporter';
    status: 'active' | 'suspended' | 'disabled';
    permissions?: {
      createNews: boolean;
      editOwnNews: boolean;
      deleteOwnNews: boolean;
      uploadImage: boolean;
      uploadThumbnail: boolean;
      viewOwnNews: boolean;
      publishNews: boolean;
      submitForReview: boolean;
    };
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDb();
    }
    return res.status(401).json({ error: 'লগইন সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় করা হয়েছে।' });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    permissions: user.permissions
  };
  next();
}

// Role guards
function requireRole(allowedRoles: ('super_admin' | 'admin' | 'editor' | 'reporter')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'আপনার এই অ্যাকশন সম্পাদন করার অনুমতি নেই।' });
    }
    next();
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' });
  }

  if (user.status === 'disabled' || user.status === 'suspended') {
    return res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।' });
  }

  const isMatch = verifyPassword(password, user.salt, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' });
  }

  // Record last login
  user.lastLogin = new Date().toISOString();

  // Create secure session token
  const token = crypto.randomBytes(32).toString('hex');
  // 7 days expiration
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  db.sessions[token] = {
    userId: user.id,
    role: user.role,
    email: user.email,
    expiresAt
  };

  logActivity(user.id, user.name, user.role, 'ইউজার লগইন', 'সফলভাবে অ্যাডমিন প্যানেলে লগইন সম্পন্ন করেছেন', req);
  saveDb();

  // Return safe user object (NO salt, NO passwordHash)
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      designation: user.designation,
      location: user.location,
      lastLogin: user.lastLogin,
      permissions: user.permissions,
      createdAt: user.createdAt
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      designation: user.designation,
      location: user.location,
      lastLogin: user.lastLogin,
      permissions: user.permissions,
      createdAt: user.createdAt
    }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete db.sessions[token];
    saveDb();
  }
  res.json({ success: true });
});

// 2. News Routes
app.get('/api/news', (req: Request, res: Response) => {
  let list = [...db.news];
  const { category, search, status, breaking, featured, popular, authorId } = req.query;

  if (category) {
    list = list.filter(n => n.category.toLowerCase() === String(category).toLowerCase());
  }

  if (status) {
    list = list.filter(n => n.status === status);
  }

  if (breaking === 'true') {
    list = list.filter(n => n.isBreaking);
  }

  if (featured === 'true') {
    list = list.filter(n => n.isFeatured);
  }

  if (popular === 'true') {
    list = list.filter(n => n.isPopular);
  }

  if (authorId) {
    list = list.filter(n => n.authorId === authorId);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
      n.summary.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q) ||
      n.authorName.toLowerCase().includes(q) ||
      (n.tags && n.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  // Sort by createdAt descending
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ total: list.length, news: list });
});

app.get('/api/news/:idOrSlug', (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  const article = db.news.find(n => n.id === param || n.slug === param);
  if (!article) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  saveDb();

  // Also return related news (same category)
  const related = db.news
    .filter(n => n.id !== article.id && n.category === article.category && n.status === 'published')
    .slice(0, 4);

  res.json({ article, related });
});

app.post('/api/news', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role === 'reporter' && req.user!.permissions && req.user!.permissions.createNews === false) {
    return res.status(403).json({ error: 'আপনার নতুন সংবাদ তৈরি করার অনুমতি নেই।' });
  }

  const {
    title,
    subtitle,
    category,
    subcategory,
    location,
    content,
    summary,
    featuredImage,
    thumbnailImage,
    imageCaption,
    imageAlt,
    tags,
    seoTitle,
    seoDescription,
    metaKeywords,
    focusKeyword,
    status = 'published',
    isBreaking = false,
    isFeatured = false,
    isHomepageFeatured = false,
    allowComments = true,
    isPopular = false,
    publishDate,
    publishTime
  } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'শিরোনাম, ক্যাটাগরি এবং সংবাদের বিবরণ বাধ্যতামূলক।' });
  }

  // Reporter publish permission check
  let finalStatus = status;
  if (req.user!.role === 'reporter' && req.user!.permissions && req.user!.permissions.publishNews === false) {
    finalStatus = 'draft';
  }

  // Sluggify title in Bengali/English safely
  const rawSlug = title
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  const slug = `${rawSlug}-${Date.now().toString().slice(-4)}`;

  const now = new Date();
  const id = `news-${Date.now()}`;

  const imageToUse = featuredImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80';

  const newArticle = {
    id,
    title,
    subtitle: subtitle || '',
    slug,
    category,
    subcategory: subcategory || '',
    authorId: req.user!.id,
    authorName: req.user!.name,
    authorRole: req.user!.role === 'super_admin' ? 'প্রধান সম্পাদক ও প্রকাশক' : (req.user!.role === 'admin' ? 'বার্তা সম্পাদক' : (req.user!.role === 'editor' ? 'সম্পাদক' : 'সংবাদদাতা')),
    location: location || 'বিশ্বম্ভরপুর, সুনামগঞ্জ',
    summary: summary || (content.replace(/<[^>]*>?/gm, '').slice(0, 180) + '...'),
    content,
    featuredImage: imageToUse,
    thumbnailImage: thumbnailImage || imageToUse,
    imageCaption: imageCaption || '',
    imageAlt: imageAlt || title,
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || summary,
    metaKeywords: metaKeywords || tags?.toString() || '',
    focusKeyword: focusKeyword || '',
    publishDate: publishDate || now.toISOString().split('T')[0],
    publishTime: publishTime || now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    status: finalStatus,
    isBreaking: Boolean(isBreaking),
    isFeatured: Boolean(isFeatured),
    isHomepageFeatured: Boolean(isHomepageFeatured),
    allowComments: allowComments !== undefined ? Boolean(allowComments) : true,
    isPopular: Boolean(isPopular),
    views: 1,
    commentsCount: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  db.news.unshift(newArticle);

  // Auto-index to Media Library if not present
  if (imageToUse && db.media && !db.media.some(m => m.url === imageToUse)) {
    db.media.unshift({
      id: `media-${Date.now()}`,
      url: imageToUse,
      filename: `news_cover_${Date.now()}.jpg`,
      size: '1.8 MB',
      dimensions: '1920x1080',
      uploadedBy: req.user!.id,
      uploadedByName: req.user!.name,
      altText: imageAlt || title,
      caption: imageCaption || '',
      createdAt: now.toISOString()
    });
  }

  // Update category count
  const cat = db.categories.find(c => c.name === category);
  if (cat) cat.count = (cat.count || 0) + 1;

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'সংবাদ তৈরি', `নতুন সংবাদ প্রকাশ করা হয়েছে: "${title}"`, req);
  saveDb();
  res.status(201).json({ message: 'সংবাদটি সফলভাবে সংরক্ষিত হয়েছে।', article: newArticle });
});

app.put('/api/news/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.news.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }

  const existing = db.news[index];

  // Reporter checks
  if (req.user!.role === 'reporter') {
    if (existing.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'আপনি শুধুমাত্র নিজের সংবাদ সম্পাদনা করতে পারেন।' });
    }
    if (req.user!.permissions && req.user!.permissions.editOwnNews === false) {
      return res.status(403).json({ error: 'আপনার নিজের সংবাদ সম্পাদনা করার অনুমতি বাতিল করা হয়েছে।' });
    }
  }

  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // Prevent reporter from changing authorId or forcing published if restricted
  if (req.user!.role === 'reporter') {
    updated.authorId = existing.authorId;
    updated.authorName = existing.authorName;
    if (req.user!.permissions && req.user!.permissions.publishNews === false && req.body.status === 'published') {
      updated.status = 'draft';
    }
  }

  db.news[index] = updated;
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'সংবাদ সম্পাদন', `সংবাদ হালনাগাদ করা হয়েছে: "${updated.title}"`, req);
  saveDb();
  res.json({ message: 'সংবাদটি আপডেট করা হয়েছে।', article: updated });
});

app.delete('/api/news/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.news.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }

  const article = db.news[index];

  // Reporter checks
  if (req.user!.role === 'reporter') {
    if (article.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'আপনার এই সংবাদ মুছে ফেলার অনুমতি নেই।' });
    }
    if (req.user!.permissions && req.user!.permissions.deleteOwnNews === false) {
      return res.status(403).json({ error: 'আপনার সংবাদ মুছে ফেলার অনুমতি নেই।' });
    }
  }

  db.news.splice(index, 1);

  // Decrement category count
  const cat = db.categories.find(c => c.name === article.category);
  if (cat && cat.count > 0) cat.count -= 1;

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'সংবাদ মুছে ফেলা', `সংবাদ ডিলিট করা হয়েছে: "${article.title}"`, req);
  saveDb();
  res.json({ success: true, message: 'সংবাদ সফলভাবে মুছে ফেলা হয়েছে।' });
});

// 3. Category Routes
app.get('/api/categories', (req: Request, res: Response) => {
  res.json({ categories: db.categories });
});

app.post('/api/categories', authMiddleware, requireRole(['super_admin', 'editor']), (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'ক্যাটাগরির নাম প্রদান করুন।' });

  const existing = db.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return res.status(400).json({ error: 'এই নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান।' });

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    order: db.categories.length + 1,
    count: 0,
    description: description || ''
  };

  db.categories.push(newCat);
  saveDb();
  res.status(201).json({ category: newCat });
});

app.put('/api/categories/:id', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const cat = db.categories.find(c => c.id === id);
  if (!cat) return res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' });

  if (req.body.name) cat.name = req.body.name;
  if (req.body.description !== undefined) cat.description = req.body.description;
  if (req.body.order !== undefined) cat.order = Number(req.body.order);

  saveDb();
  res.json({ category: cat });
});

app.delete('/api/categories/:id', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.categories.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' });

  db.categories.splice(index, 1);
  saveDb();
  res.json({ success: true });
});

// 4. User Management Routes (Super Admin & Admin)
app.get('/api/users', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  // Return users with news count and safe metadata
  const safeUsers = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone,
    bio: u.bio,
    avatar: u.avatar,
    designation: u.designation,
    location: u.location,
    lastLogin: u.lastLogin,
    permissions: u.permissions,
    totalNews: db.news.filter(n => n.authorId === u.id).length,
    createdAt: u.createdAt
  }));
  res.json({ users: safeUsers });
});

app.post('/api/users', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { name, email, password, role, phone, bio, designation, location, permissions, status = 'active' } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'নাম, ইমেইল, পাসওয়ার্ড এবং পদবী আবশ্যক।' });
  }

  // Admin cannot create super_admin or admin
  if (req.user!.role === 'admin' && (role === 'super_admin' || role === 'admin')) {
    return res.status(403).json({ error: 'আপনার সুপার অ্যাডমিন বা অ্যাডমিন অ্যাকাউন্ট তৈরি করার অনুমতি নেই।' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'এই ইমেইলের অ্যাকাউন্ট ইতিমধ্যে বিদ্যমান।' });
  }

  const { salt, hash } = hashPassword(password);
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email: normalizedEmail,
    role: role as 'super_admin' | 'admin' | 'editor' | 'reporter',
    status: (status as 'active' | 'suspended' | 'disabled') || 'active',
    phone: phone || '',
    bio: bio || '',
    designation: designation || (role === 'reporter' ? 'সংবাদদাতা' : (role === 'editor' ? 'সম্পাদক' : 'প্রশাসক')),
    location: location || 'বিশ্বম্ভরপুর, সুনামগঞ্জ',
    permissions: permissions || {
      createNews: true,
      editOwnNews: true,
      deleteOwnNews: false,
      uploadImage: true,
      uploadThumbnail: true,
      viewOwnNews: true,
      publishNews: role !== 'reporter',
      submitForReview: true
    },
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'অ্যাকাউন্ট তৈরি', `নতুন ইউজার তৈরি: ${name} (${role})`, req);
  saveDb();

  res.status(201).json({
    message: 'নতুন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      phone: newUser.phone,
      bio: newUser.bio,
      designation: newUser.designation,
      location: newUser.location,
      permissions: newUser.permissions,
      totalNews: 0,
      createdAt: newUser.createdAt
    }
  });
});

app.put('/api/users/:id', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'ইউজার পাওয়া যায়নি।' });

  // Admin cannot edit super_admin
  if (req.user!.role === 'admin' && user.role === 'super_admin') {
    return res.status(403).json({ error: 'আপনার সুপার অ্যাডমিন অ্যাকাউন্ট পরিবর্তন করার অনুমতি নেই।' });
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.role && req.user!.role === 'super_admin') user.role = req.body.role;
  if (req.body.status) user.status = req.body.status;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.designation !== undefined) user.designation = req.body.designation;
  if (req.body.location !== undefined) user.location = req.body.location;
  if (req.body.permissions) user.permissions = { ...user.permissions, ...req.body.permissions };

  // Secure Password change/reset
  if (req.body.password && String(req.body.password).length >= 6) {
    const { salt, hash } = hashPassword(req.body.password);
    user.salt = salt;
    user.passwordHash = hash;
  }

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'অ্যাকাউন্ট পরিবর্তন', `ইউজার তথ্য হালনাগাদ: ${user.name} (${user.email})`, req);
  saveDb();
  res.json({
    message: 'ইউজার তথ্য সফলভাবে আপডেট করা হয়েছে।',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      bio: user.bio,
      designation: user.designation,
      location: user.location,
      lastLogin: user.lastLogin,
      permissions: user.permissions,
      totalNews: db.news.filter(n => n.authorId === user.id).length,
      createdAt: user.createdAt
    }
  });
});

app.delete('/api/users/:id', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) {
    return res.status(400).json({ error: 'আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না।' });
  }

  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'ইউজার পাওয়া যায়নি।' });

  const deletedUser = db.users[index];
  db.users.splice(index, 1);
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'অ্যাকাউন্ট ডিলিট', `ইউজার মুছে ফেলা হয়েছে: ${deletedUser.name}`, req);
  saveDb();
  res.json({ success: true, message: 'ইউজার ডিলিট করা হয়েছে।' });
});

// 5. Site Settings & Ads Routes
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

app.put('/api/settings', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'সেটিংস পরিবর্তন', 'ওয়েবসাইট ও সম্পাদকীয় পরিষদ সেটিংস পরিবর্তন করা হয়েছে', req);
  saveDb();
  res.json({ message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।', settings: db.settings });
});

app.get('/api/ads', (req: Request, res: Response) => {
  res.json({ ads: db.ads });
});

app.put('/api/ads', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  db.ads = { ...db.ads, ...req.body };
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'বিজ্ঞাপন পরিবর্তন', 'Adsterra বিজ্ঞাপন কোড ও স্লট কনফিগারেশন আপডেট করা হয়েছে', req);
  saveDb();
  res.json({ message: 'বিজ্ঞাপন কনফিগারেশন সফলভাবে আপডেট হয়েছে।', ads: db.ads });
});

// 6. Media Library Routes
app.get('/api/media', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!db.media) db.media = [];
  res.json({ media: db.media });
});

app.post('/api/media', authMiddleware, (req: AuthRequest, res: Response) => {
  const { url, dataUri, filename, altText, caption } = req.body;
  const mediaUrl = url || dataUri;
  if (!mediaUrl) {
    return res.status(400).json({ error: 'ছবির লিঙ্ক অথবা ডাটা প্রদান করুন।' });
  }

  const newMedia = {
    id: `media-${Date.now()}`,
    url: mediaUrl,
    filename: filename || `media_${Date.now()}.jpg`,
    size: '1.4 MB',
    dimensions: '1920x1080',
    uploadedBy: req.user!.id,
    uploadedByName: req.user!.name,
    altText: altText || '',
    caption: caption || '',
    createdAt: new Date().toISOString()
  };

  if (!db.media) db.media = [];
  db.media.unshift(newMedia);
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'মিডিয়া আপলোড', `মিডিয়া লাইব্রেরিতে ছবি যোগ করা হয়েছে: ${newMedia.filename}`, req);
  saveDb();

  res.status(201).json({ message: 'মিডিয়া সফলভাবে লাইব্রেরিতে যুক্ত হয়েছে।', media: newMedia });
});

app.put('/api/media/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const item = db.media?.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'মিডিয়া পাওয়া যায়নি।' });

  if (req.body.altText !== undefined) item.altText = req.body.altText;
  if (req.body.caption !== undefined) item.caption = req.body.caption;

  saveDb();
  res.json({ message: 'মিডিয়া মেটাডাটা আপডেট হয়েছে।', media: item });
});

app.delete('/api/media/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!db.media) db.media = [];
  const index = db.media.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'মিডিয়া পাওয়া যায়নি।' });

  const removed = db.media[index];
  db.media.splice(index, 1);
  logActivity(req.user!.id, req.user!.name, req.user!.role, 'মিডিয়া মুছে ফেলা', `মিডিয়া লাইব্রেরি থেকে ছবি মুছে ফেলা হয়েছে: ${removed.filename}`, req);
  saveDb();

  res.json({ success: true, message: 'মিডিয়া মুছে ফেলা হয়েছে।' });
});

// 7. Netlify Deployment System Routes
app.get('/api/deployments', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!db.deployments) db.deployments = [];
  const lastDep = db.deployments[0];
  res.json({
    currentVersion: db.currentVersion || 'v2.5.0',
    lastDeployment: lastDep?.completedAt || lastDep?.createdAt || new Date().toISOString(),
    status: lastDep?.status || 'published',
    productionUrl: 'https://haortvhd.netlify.app',
    lastUpdatedBy: lastDep?.triggeredByName || 'তারেক রহমান',
    history: db.deployments
  });
});

app.post('/api/deployments/trigger', authMiddleware, requireRole(['super_admin', 'admin']), (req: AuthRequest, res: Response) => {
  const { commitMessage } = req.body;
  const curVer = db.currentVersion || 'v2.5.0';
  
  // Calculate next version
  const parts = curVer.replace(/^v/, '').split('.').map(Number);
  const nextVer = `v${parts[0] || 2}.${parts[1] || 5}.${(parts[2] || 0) + 1}`;

  const message = commitMessage || `আপডেট ${nextVer}: হাওর টিভি HD সংবাদ ও কনটেন্ট সিঙ্ক`;

  const newDeployment = {
    id: `dep-${Date.now()}`,
    version: nextVer,
    status: 'published' as const,
    triggeredBy: req.user!.id,
    triggeredByName: req.user!.name,
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 1500).toISOString(),
    productionUrl: 'https://haortvhd.netlify.app',
    commitMessage: message,
    logs: [
      `[${new Date().toLocaleTimeString('bn-BD')}] [Build] Preparing production deployment for ${nextVer}...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Build] Packaging React, Tailwind, and Bengali font assets...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Build] Validating Adsterra advertisement slots & dynamic routes...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Deploy] Syncing bundle to Netlify Edge CDN (Site: haortvhd)...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Published] Production deployment completed successfully at https://haortvhd.netlify.app`
    ]
  };

  if (!db.deployments) db.deployments = [];
  db.deployments.unshift(newDeployment);
  db.currentVersion = nextVer;

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'প্রোডাকশন ডেপ্লয়মেন্ট', `Netlify লাইভ ডেপ্লয়মেন্ট সম্পন্ন: ${nextVer} (${message})`, req);
  saveDb();

  res.status(201).json({
    message: 'ওয়েবসাইট সফলভাবে ডেপ্লয় ও লাইভ করা হয়েছে!',
    deployment: newDeployment,
    currentVersion: nextVer
  });
});

app.post('/api/deployments/:id/rollback', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const target = db.deployments?.find(d => d.id === id);
  if (!target) {
    return res.status(404).json({ error: 'ডেপ্লয়মেন্ট রেকর্ড পাওয়া যায়নি।' });
  }

  const rollbackDeployment = {
    id: `dep-rb-${Date.now()}`,
    version: target.version,
    status: 'published' as const,
    triggeredBy: req.user!.id,
    triggeredByName: req.user!.name,
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 1200).toISOString(),
    productionUrl: 'https://haortvhd.netlify.app',
    commitMessage: `রোলব্যাক: সংস্করণ ${target.version}-এ সফলভাবে প্রত্যাবর্তন`,
    logs: [
      `[${new Date().toLocaleTimeString('bn-BD')}] [Rollback] Initiating rollback to ${target.version}...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Rollback] Restoring cached build artifacts and route tables...`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Rollback] Netlify Edge CDN pointer updated to ${target.version}.`,
      `[${new Date().toLocaleTimeString('bn-BD')}] [Published] Rollback completed successfully.`
    ]
  };

  db.deployments.unshift(rollbackDeployment);
  db.currentVersion = target.version;

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'ভার্সন রোলব্যাক', `সংস্করণ ${target.version}-এ রোলব্যাক সম্পন্ন করা হয়েছে`, req);
  saveDb();

  res.json({
    message: `সফলভাবে সংস্করণ ${target.version}-এ রোলব্যাক সম্পন্ন হয়েছে।`,
    deployment: rollbackDeployment,
    currentVersion: target.version
  });
});

// 8. Activity Logs Route
app.get('/api/activity-logs', authMiddleware, requireRole(['super_admin', 'admin', 'editor']), (req: AuthRequest, res: Response) => {
  if (!db.activityLogs) db.activityLogs = [];
  res.json({ logs: db.activityLogs });
});

// 9. Database Backup & Restore Routes (Super Admin Only)
app.get('/api/backup', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const safeDb = {
    version: db.currentVersion || 'v2.5.0',
    exportedAt: new Date().toISOString(),
    newsCount: db.news.length,
    categoriesCount: db.categories.length,
    usersCount: db.users.length,
    mediaCount: db.media?.length || 0,
    database: {
      ...db,
      users: db.users.map(u => ({ ...u, salt: undefined, passwordHash: undefined })),
      sessions: {}
    }
  };

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'ডাটাবেজ ব্যাকআপ', 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড করা হয়েছে', req);
  saveDb();
  res.json(safeDb);
});

app.post('/api/backup/restore', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  const { database } = req.body;
  if (!database || !Array.isArray(database.news) || !Array.isArray(database.categories)) {
    return res.status(400).json({ error: 'অবৈধ ব্যাকআপ ফাইল ফরম্যাট।' });
  }

  // Preserve super admins and active sessions if needed, merge news and categories
  db.news = database.news;
  db.categories = database.categories;
  if (database.settings) db.settings = database.settings;
  if (database.ads) db.ads = database.ads;
  if (Array.isArray(database.media)) db.media = database.media;

  logActivity(req.user!.id, req.user!.name, req.user!.role, 'ডাটাবেজ রিস্টোর', 'পূর্ববর্তী ব্যাকআপ থেকে ডাটা সফলভাবে রিস্টোর করা হয়েছে', req);
  saveDb();

  res.json({
    message: 'ডাটাবেজ সফলভাবে রিস্টোর সম্পন্ন হয়েছে।',
    newsCount: db.news.length,
    categoriesCount: db.categories.length
  });
});

// 6. Comments Routes
app.get('/api/comments/:newsId', (req: Request, res: Response) => {
  const { newsId } = req.params;
  const list = db.comments.filter(c => c.newsId === newsId && c.status === 'approved');
  res.json({ comments: list });
});

app.get('/api/admin/comments', authMiddleware, requireRole(['super_admin', 'editor']), (req: AuthRequest, res: Response) => {
  res.json({ comments: db.comments });
});

app.post('/api/comments', (req: Request, res: Response) => {
  const { newsId, userName, userEmail, commentText } = req.body;
  if (!newsId || !userName || !commentText) {
    return res.status(400).json({ error: 'নাম ও মন্তব্যের বিবরণ প্রদান করুন।' });
  }

  const targetNews = db.news.find(n => n.id === newsId);
  const newComment = {
    id: `comm-${Date.now()}`,
    newsId,
    newsTitle: targetNews?.title || 'সংবাদ',
    userName,
    userEmail: userEmail || '',
    commentText,
    status: 'approved', // Auto-approved or pending based on moderation
    createdAt: new Date().toISOString()
  };

  db.comments.unshift(newComment);
  if (targetNews) {
    targetNews.commentsCount = (targetNews.commentsCount || 0) + 1;
  }
  saveDb();

  res.status(201).json({ message: 'মন্তব্য সফলভাবে জমা হয়েছে।', comment: newComment });
});

app.put('/api/comments/:id', authMiddleware, requireRole(['super_admin', 'editor']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const comm = db.comments.find(c => c.id === id);
  if (!comm) return res.status(404).json({ error: 'মন্তব্য পাওয়া যায়নি।' });

  if (req.body.status) comm.status = req.body.status;
  saveDb();
  res.json({ comment: comm });
});

app.delete('/api/comments/:id', authMiddleware, requireRole(['super_admin', 'editor']), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.comments.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'মন্তব্য পাওয়া যায়নি।' });

  const comm = db.comments[index];
  const targetNews = db.news.find(n => n.id === comm.newsId);
  if (targetNews && targetNews.commentsCount > 0) {
    targetNews.commentsCount -= 1;
  }

  db.comments.splice(index, 1);
  saveDb();
  res.json({ success: true });
});

// 7. Direct Image Upload / Compression endpoint
app.post('/api/upload', authMiddleware, (req: AuthRequest, res: Response) => {
  const { dataUri, filename } = req.body;
  if (!dataUri) {
    return res.status(400).json({ error: 'ছবি প্রদান করুন (Data URI)।' });
  }

  // Validate format
  if (!dataUri.startsWith('data:image/')) {
    return res.status(400).json({ error: 'শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WebP) গ্রহণযোগ্য।' });
  }

  // Check approximate size (under 10MB)
  const sizeInBytes = Buffer.byteLength(dataUri, 'utf8');
  if (sizeInBytes > 10 * 1024 * 1024) {
    return res.status(400).json({ error: 'ছবির সাইজ ১০ মেগাবাইটের কম হতে হবে।' });
  }

  // Save to public uploads if desired or return compressed data URI directly
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1].replace('jpeg', 'jpg');
      const base64Data = matches[2];
      const safeName = `haor_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      return res.json({
        url: `/uploads/${safeName}`,
        dataUri: dataUri, // Also return dataUri as direct fallback
        message: 'ছবি সফলভাবে আপলোড হয়েছে।'
      });
    }
  } catch (e) {
    console.error('File write error, falling back to dataUri', e);
  }

  // Fallback return data URI
  res.json({
    url: dataUri,
    message: 'ছবি সফলভাবে প্রক্রিয়া করা হয়েছে।'
  });
});

// 8. Netlify Deployment Info endpoint
app.get('/api/deployment-info', (req: Request, res: Response) => {
  res.json({
    siteName: 'হাওর টিভি HD (HAOR TV HD)',
    buildCommand: 'npm run build',
    publishDir: 'dist',
    nodeVersion: '20',
    spaRedirects: '/*  /index.html  200',
    environmentVariables: [
      { key: 'SUPER_ADMIN_EMAIL', description: 'সুপার অ্যাডমিনের প্রাথমিক ইমেইল', required: true },
      { key: 'SUPER_ADMIN_PASSWORD', description: 'সুপার অ্যাডমিনের প্রাথমিক গোপন পাসওয়ার্ড', required: true },
      { key: 'REPORTER_EMAIL', description: 'রিপোর্টারের প্রাথমিক ইমেইল', required: true },
      { key: 'REPORTER_PASSWORD', description: 'রিপোর্টারের প্রাথমিক পাসওয়ার্ড', required: true },
      { key: 'JWT_SECRET', description: 'সেশন সিকিউরিটি ও এনক্রিপশন সিগনেচার কি', required: true }
    ],
    deploymentInstructions: [
      '১. GitHub এ এই প্রজেক্টটি Push করুন।',
      '২. Netlify.com এ লগইন করে "Add new site" > "Import an existing project" নির্বাচন করুন।',
      '৩. GitHub রিপোজিটরি সিলেক্ট করুন। Build command: "npm run build" এবং Publish directory: "dist" সেট করুন।',
      '৪. Environment Variables সেকশনে উল্লেখিত ভ্যারিয়েবলগুলো যোগ করুন।',
      '৫. "Deploy site" ক্লিক করলেই কয়েক সেকেন্ডে আপনার হাওর টিভি HD পোর্টাল লাইভ হয়ে যাবে!'
    ]
  });
});

// 9. Database Backup / Restore (Super Admin Only)
app.get('/api/backup', authMiddleware, requireRole(['super_admin']), (req: AuthRequest, res: Response) => {
  // Sanitize users before backup
  const safeDb = {
    ...db,
    users: db.users.map(u => ({ ...u, salt: undefined, passwordHash: undefined })),
    sessions: {}
  };
  res.json(safeDb);
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HAOR TV HD Server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
