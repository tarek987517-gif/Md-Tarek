import React, { useState, useEffect } from 'react';
import { Category, NewsArticle, SiteSettings, User, AdSettings } from './types';
import { INITIAL_CATEGORIES, INITIAL_NEWS, INITIAL_SETTINGS, INITIAL_ADS } from './data/initialData';
import { api } from './lib/api';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { HeroLeadSection } from './components/HeroLeadSection';
import { HaorSpecialSection } from './components/HaorSpecialSection';
import { CategoryNewsBlock } from './components/CategoryNewsBlock';
import { VideoGallerySection } from './components/VideoGallerySection';
import { Footer } from './components/Footer';
import { NewsDetailsModalOrPage } from './components/NewsDetailsModalOrPage';
import { SearchModal } from './components/SearchModal';
import { StaticPagesModal } from './components/StaticPagesModal';
import { LoginModal } from './components/LoginModal';
import { LiveTvModal } from './components/LiveTvModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdsterraSlot } from './components/AdsterraSlot';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { timeAgoBengali, toBengaliNumber } from './lib/utils';

export default function App() {
  // Main Data States
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [ads, setAds] = useState<AdSettings>(INITIAL_ADS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Routing / View States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLiveTvOpen, setIsLiveTvOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [staticModalPage, setStaticModalPage] = useState<'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | null>(null);

  // Fetch initial data from backend API
  const loadInitialData = async () => {
    try {
      const data = await api.getInitialData();
      if (data.categories?.length) setCategories(data.categories);
      if (data.news?.length) setNewsList(data.news);
      if (data.settings) setSiteSettings(data.settings);
      if (data.ads) setAds(data.ads);
    } catch {
      // fallback to initial data already in state
    }

    try {
      const user = await api.getMe();
      if (user) setCurrentUser(user);
    } catch {
      // not logged in
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Check URL path for deep linking like /news/:slug
    const path = window.location.pathname;
    if (path.startsWith('/news/')) {
      const slug = decodeURIComponent(path.replace('/news/', ''));
      const found = INITIAL_NEWS.find((n: NewsArticle) => n.slug === slug);
      if (found) {
        setSelectedArticle(found);
      }
    }

    // Handle browser popstate
    const handlePopState = () => {
      const curPath = window.location.pathname;
      if (curPath.startsWith('/news/')) {
        const slug = decodeURIComponent(curPath.replace('/news/', ''));
        const found = newsList.find((n: NewsArticle) => n.slug === slug);
        if (found) setSelectedArticle(found);
      } else {
        setSelectedArticle(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title dynamically
  useEffect(() => {
    if (selectedArticle) {
      document.title = `${selectedArticle.title} - ${siteSettings.siteName}`;
    } else if (selectedCategory) {
      document.title = `${selectedCategory} এর তাজা খবর - ${siteSettings.siteName}`;
    } else {
      document.title = `${siteSettings.siteName} | ${siteSettings.siteTagline}`;
    }
  }, [selectedArticle, selectedCategory, siteSettings]);

  // Handle article selection & clean URL push
  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    window.history.pushState(null, '', `/news/${encodeURIComponent(article.slug)}`);
    // Track article view
    api.trackView(article.id).catch(() => {});
  };

  // Back to home
  const handleBackToHome = () => {
    setSelectedArticle(null);
    window.history.pushState(null, '', '/');
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedArticle(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setCurrentUser(null);
    setIsDashboardOpen(false);
  };

  // Filter news for category view if selected
  const categoryNews = selectedCategory
    ? newsList.filter(
        n =>
          (n.category === selectedCategory ||
            (selectedCategory === 'বিশ্বম্ভরপুর' && n.location.includes('বিশ্বম্ভরপুর')) ||
            (selectedCategory === 'সুনামগঞ্জ' && n.location.includes('সুনামগঞ্জ'))) &&
          n.status === 'published'
      )
    : [];

  // Related news for current article
  const relatedNews = selectedArticle
    ? newsList
        .filter(n => n.id !== selectedArticle.id && n.category === selectedArticle.category && n.status === 'published')
        .slice(0, 4)
    : [];

  const popularNews = [...newsList]
    .filter(n => n.status === 'published')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans selection:bg-red-700 selection:text-white">
      {/* Header */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        siteSettings={siteSettings}
        headerAd={ads.headerBanner}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLiveTv={() => setIsLiveTvOpen(true)}
      />

      {/* Breaking News Ticker */}
      <BreakingNewsTicker
        newsList={newsList}
        onSelectArticle={handleSelectArticle}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {selectedArticle ? (
          /* News Details Full View */
          <NewsDetailsModalOrPage
            article={selectedArticle}
            relatedNews={relatedNews}
            popularNews={popularNews}
            newsDetailsAd={ads.newsDetailsBanner}
            sidebarAd={ads.sidebarBanner}
            currentUser={currentUser}
            onBack={handleBackToHome}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
          />
        ) : selectedCategory ? (
          /* Category Filtered View */
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory('')}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition"
                  title="প্রচ্ছদে ফিরে যান"
                >
                  <ArrowLeft className="w-5 h-5 text-red-700" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                    {selectedCategory}
                  </h1>
                  <p className="text-xs text-gray-500">
                    এই ক্যাটাগরিতে মোট {toBengaliNumber(categoryNews.length)} টি সংবাদ প্রকাশিত হয়েছে
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs bg-red-50 text-red-700 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition self-start sm:self-auto"
              >
                সব খবর দেখুন
              </button>
            </div>

            {categoryNews.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center border border-gray-200 text-gray-500">
                <p className="text-base font-semibold">এই ক্যাটাগরিতে এখনো কোনো সংবাদ নেই।</p>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="mt-3 text-xs bg-red-700 text-white px-4 py-2 rounded font-semibold"
                >
                  প্রচ্ছদে ফিরে যান
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryNews.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectArticle(item)}
                    className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-red-300 transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                        <img
                          src={item.thumbnailImage || item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                        <span className="absolute bottom-2 left-2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-600" />
                            {item.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgoBengali(item.createdAt)}
                          </span>
                        </div>

                        <h2 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug font-serif mb-2">
                          {item.title}
                        </h2>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>প্রতিবেদক: {item.authorName}</span>
                      <span className="font-semibold text-red-700">বিস্তারিত পড়ুন &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Homepage View */
          <main className="space-y-6">
            {/* 1. Hero Lead Section (8-Col Lead + 4-Col Latest/Popular) */}
            <HeroLeadSection
              newsList={newsList}
              onSelectArticle={handleSelectArticle}
            />

            {/* 2. Middle Banner Ad Slot (728x90) */}
            {ads.homepageBanner && (
              <AdsterraSlot
                ad={ads.homepageBanner}
                slotLabel="হোমপেজ মিডল বিজ্ঞাপন (৭২৮x৯০)"
                className="max-w-4xl mx-auto"
              />
            )}

            {/* 3. Haor Special Regional Spotlight (Sunamganj, Bishwambharpur) */}
            <HaorSpecialSection
              newsList={newsList}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
            />

            {/* 4. Category News Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryNewsBlock
                categoryName="জাতীয়"
                articles={newsList.filter(n => n.category === 'জাতীয়' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
              <CategoryNewsBlock
                categoryName="রাজনীতি"
                articles={newsList.filter(n => n.category === 'রাজনীতি' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryNewsBlock
                categoryName="অর্থনীতি"
                articles={newsList.filter(n => n.category === 'অর্থনীতি' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
              <CategoryNewsBlock
                categoryName="কৃষি"
                articles={newsList.filter(n => n.category === 'কৃষি' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryNewsBlock
                categoryName="আন্তর্জাতিক"
                articles={newsList.filter(n => n.category === 'আন্তর্জাতিক' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
              <CategoryNewsBlock
                categoryName="খেলাধুলা"
                articles={newsList.filter(n => n.category === 'খেলাধুলা' && n.status === 'published')}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            {/* 5. Haor TV HD Video Bulletins & Digital Studio */}
            <VideoGallerySection />
          </main>
        )}
      </div>

      {/* Footer */}
      <Footer
        siteSettings={siteSettings}
        categories={categories}
        footerAd={ads.footerBanner}
        onSelectCategory={handleSelectCategory}
        onOpenStaticModal={key => setStaticModalPage(key)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={categories}
        newsList={newsList}
        onSelectArticle={handleSelectArticle}
      />

      <StaticPagesModal
        pageKey={staticModalPage}
        onClose={() => setStaticModalPage(null)}
        siteSettings={siteSettings}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user);
          setIsDashboardOpen(true);
        }}
      />

      <LiveTvModal
        isOpen={isLiveTvOpen}
        onClose={() => setIsLiveTvOpen(false)}
      />

      {isDashboardOpen && currentUser && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setIsDashboardOpen(false)}
          onLogout={handleLogout}
          categories={categories}
          allNews={newsList}
          ads={ads as any}
          siteSettings={siteSettings}
          onRefreshData={loadInitialData}
        />
      )}
    </div>
  );
}
