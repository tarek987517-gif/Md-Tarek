import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Tv, 
  User as UserIcon, 
  Facebook, 
  Youtube, 
  Twitter, 
  Calendar, 
  CloudSun, 
  ChevronDown,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Category, SiteSettings, User, AdItem } from '../types';
import { getBengaliDate } from '../lib/utils';
import { AdsterraSlot } from './AdsterraSlot';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  siteSettings: SiteSettings;
  headerAd?: AdItem;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenDashboard: () => void;
  onLogout: () => void;
  onOpenSearch: () => void;
  onOpenLiveTv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  siteSettings,
  headerAd,
  currentUser,
  onOpenLogin,
  onOpenDashboard,
  onLogout,
  onOpenSearch,
  onOpenLiveTv
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false);
  const { englishDate, banglaDate } = getBengaliDate();

  // Primary categories to show in top navbar
  const primaryCategoryNames = [
    'সব খবর',
    'জাতীয়',
    'রাজনীতি',
    'সুনামগঞ্জ',
    'বিশ্বম্ভরপুর',
    'সিলেট',
    'আন্তর্জাতিক',
    'অর্থনীতি',
    'খেলাধুলা',
    'কৃষি',
    'প্রযুক্তি'
  ];

  const primaryCategories = categories.filter(c => primaryCategoryNames.includes(c.name));
  const moreCategories = categories.filter(c => !primaryCategoryNames.includes(c.name) && c.name !== 'সব খবর');

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      {/* Top Utility Bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Date & Weather */}
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>{englishDate}</span>
              <span className="hidden md:inline text-gray-500">|</span>
              <span className="hidden md:inline text-gray-400">{banglaDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-yellow-400">
              <CloudSun className="w-3.5 h-3.5" />
              <span>বিশ্বম্ভরপুর ও সুনামগঞ্জ: ২৯° সে. (রৌদ্রোজ্জ্বল)</span>
            </div>
          </div>

          {/* Social Links & User Status */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-gray-700">
              <a
                href={siteSettings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-blue-400 transition"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={siteSettings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-red-500 transition"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href={siteSettings.twitterUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="hover:text-sky-400 transition"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Live TV Button */}
            <button
              id="live-tv-header-btn"
              onClick={onOpenLiveTv}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-0.5 rounded text-[11px] transition shadow-sm animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <Tv className="w-3 h-3" />
              <span>লাইভ টিভি</span>
            </button>

            {/* Auth status */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-dashboard-btn"
                  onClick={onOpenDashboard}
                  className="flex items-center gap-1 text-red-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded transition text-[11px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[110px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-1 rounded uppercase">
                    {currentUser.role === 'super_admin' ? 'অ্যাডমিন' : currentUser.role === 'editor' ? 'সম্পাদক' : 'রিপোর্টার'}
                  </span>
                </button>
                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  title="লগআউট"
                  className="text-gray-400 hover:text-red-400 p-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-0.5 rounded transition text-[11px]"
              >
                <UserIcon className="w-3 h-3" />
                <span>লগইন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding & Header Ad */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo Section */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => onSelectCategory('')}
              className="cursor-pointer flex items-center gap-3 select-none"
            >
              {/* Distinctive TV Logo */}
              <div className="relative flex items-center justify-center w-14 h-12 bg-gradient-to-br from-red-700 via-red-600 to-red-900 rounded-lg shadow-md border-2 border-red-800 text-white font-black">
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[13px] tracking-wider text-yellow-300 font-bold">হাওর</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-sm font-extrabold text-white">টিভি</span>
                    <span className="text-[9px] bg-yellow-400 text-gray-950 font-black px-1 rounded">HD</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-red-700 tracking-tight font-sans">
                    {siteSettings.siteName}
                  </h1>
                  <span className="text-xs font-bold text-gray-600 border border-gray-300 px-1.5 py-0.5 rounded">
                    অনলাইন
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                  {siteSettings.siteTagline}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenSearch}
                aria-label="অনুসন্ধান"
                className="p-2 text-gray-600 hover:text-red-700 rounded-full hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="মেনু"
                className="p-2 text-gray-700 hover:text-red-700 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Header Ad Slot (728x90) */}
          <div className="hidden md:block w-full max-w-[580px] lg:max-w-[728px]">
            {headerAd && <AdsterraSlot ad={headerAd} slotLabel="হেডার বিজ্ঞাপন (৭২৮x৯০)" className="!my-0 !py-1" />}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-red-700 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto no-scrollbar py-0.5 space-x-1 sm:space-x-2 text-sm font-semibold">
            {/* Home button */}
            <button
              id="nav-cat-all"
              onClick={() => onSelectCategory('')}
              className={`px-3 py-2.5 rounded-t-md transition whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-red-900 text-white font-bold border-b-2 border-yellow-400'
                  : 'text-red-100 hover:bg-red-800 hover:text-white'
              }`}
            >
              প্রচ্ছদ
            </button>

            {/* Primary Categories */}
            {primaryCategories.map(cat => (
              <button
                key={cat.id}
                id={`nav-cat-${cat.slug}`}
                onClick={() => onSelectCategory(cat.name)}
                className={`px-3 py-2.5 rounded-t-md transition whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-red-900 text-white font-bold border-b-2 border-yellow-400'
                    : 'text-red-100 hover:bg-red-800 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* More Categories Dropdown */}
            {moreCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setMoreCategoriesOpen(!moreCategoriesOpen)}
                  className="flex items-center gap-1 px-3 py-2.5 text-red-100 hover:bg-red-800 rounded-t-md whitespace-nowrap"
                >
                  <span>আরও</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {moreCategoriesOpen && (
                  <div 
                    className="absolute left-0 mt-1 w-48 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setMoreCategoriesOpen(false)}
                  >
                    {moreCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.name);
                          setMoreCategoriesOpen(false);
                        }}
                        className={`w-full text-left px-4 py-1.5 text-sm hover:bg-red-50 hover:text-red-700 transition ${
                          selectedCategory === cat.name ? 'font-bold text-red-700 bg-red-50' : ''
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Button (Desktop) */}
          <div className="hidden md:flex items-center pl-3">
            <button
              id="header-search-trigger"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 bg-red-800 hover:bg-red-900 text-white px-3 py-1.5 rounded text-xs font-medium transition shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>অনুসন্ধান</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-xl px-4 py-4 max-h-[80vh] overflow-y-auto">
          <div className="mb-3 flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase">সকল ক্যাটাগরি</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                onSelectCategory('');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded text-sm font-medium ${
                selectedCategory === '' ? 'bg-red-700 text-white' : 'bg-gray-50 text-gray-800'
              }`}
            >
              প্রচ্ছদ (সব খবর)
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.name);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded text-sm font-medium ${
                  selectedCategory === cat.name ? 'bg-red-700 text-white' : 'bg-gray-50 text-gray-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenLiveTv();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded text-sm font-semibold"
            >
              <Tv className="w-4 h-4" />
              <span>হাওর টিভি HD লাইভ দেখুন</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  onOpenDashboard();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded text-sm font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ড্যাশবোর্ড প্যানেল ({currentUser.role})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2 rounded text-sm font-medium hover:bg-gray-200"
              >
                <UserIcon className="w-4 h-4" />
                <span>সাংবাদিক ও অ্যাডমিন লগইন</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
