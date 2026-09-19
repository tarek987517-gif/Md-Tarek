import React from 'react';
import { Menu, Plus, ExternalLink, X, Bell, Globe } from 'lucide-react';
import { User } from '../../types';
import { AdminViewType } from './AdminSidebar';

interface AdminHeaderProps {
  currentView: AdminViewType;
  onOpenMobileMenu: () => void;
  onSelectView: (view: AdminViewType) => void;
  currentUser: User;
  onReturnToSite: () => void;
  currentVersion?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentView,
  onOpenMobileMenu,
  onSelectView,
  currentUser,
  onReturnToSite,
  currentVersion = 'v2.5.0'
}) => {
  const getViewTitle = (view: AdminViewType): { title: string; subtitle: string } => {
    switch (view) {
      case 'dashboard':
        return { title: 'ড্যাশবোর্ড ওভারভিউ', subtitle: 'পোর্টালের সামগ্রিক পরিসংখ্যান ও সর্বশেষ আপডেট' };
      case 'news_add':
        return { title: 'নতুন সংবাদ রচনা', subtitle: 'রিচ টেক্সট এডিটর ও ফটো আপলোডার' };
      case 'news_all':
        return { title: 'সকল প্রকাশিত সংবাদ', subtitle: 'সংবাদ ফিল্টার, সম্পাদনা ও ব্যবস্থাপনা' };
      case 'news_draft':
        return { title: 'ড্রাফট ও পেন্ডিং সংবাদ', subtitle: 'অনুমোদন ও পর্যালোচনার জন্য অপেক্ষমান' };
      case 'news_breaking':
        return { title: 'ব্রেকিং নিউজ নিয়ন্ত্রণ', subtitle: 'শীর্ষ টিকার ও জরুরি সংবাদ প্রচার' };
      case 'news_featured':
        return { title: 'শীর্ষ ও ফিচারড সংবাদ', subtitle: 'হোমপেজ লিড ও বিশেষ প্রতিবেদন' };
      case 'categories':
        return { title: 'ক্যাটাগরি ব্যবস্থাপনা', subtitle: 'সংবাদের বিভাগ ও উপ-বিভাগ সমূহ' };
      case 'media':
        return { title: 'মিডিয়া লাইব্রেরি', subtitle: 'ছবি আপলোড ও সম্পদ ব্যবস্থাপনা' };
      case 'ads':
        return { title: 'বিজ্ঞাপন ব্যবস্থাপনা (Adsterra)', subtitle: 'বিজ্ঞাপন কোড, ব্যানার ও অবস্থান কনফিগারেশন' };
      case 'users':
        return { title: 'সাংবাদিক ও ইউজার কন্ট্রোল', subtitle: 'রিপোর্টারদের ভূমিকা, জেলা ও এক্সেস পারমিশন' };
      case 'deployments':
        return { title: 'Netlify ডেপ্লয়মেন্ট ও রোলব্যাক', subtitle: 'প্রোডাকশন পাবলিশিং ও ভার্সন হিস্ট্রি' };
      case 'activity_logs':
        return { title: 'অ্যাক্টিভিটি ও অডিট লগ', subtitle: 'ব্যবহারকারীদের সমস্ত কাজের বিস্তারিত রেকর্ড' };
      case 'backup':
        return { title: 'ডাটাবেজ ব্যাকআপ ও রিস্টোর', subtitle: 'নিরাপদ ডাটা এক্সপোর্ট ও ইমপোর্ট সিস্টেম' };
      case 'settings':
        return { title: 'পোর্টাল ও সম্পাদকীয় সেটিংস', subtitle: 'ওয়েবসাইট মেটাডাটা, সম্পাদক পরিষদ ও যোগাযোগ' };
      default:
        return { title: 'অ্যাডমিন প্যানেল', subtitle: 'হাওর টিভি HD CMS' };
    }
  };

  const info = getViewTitle(currentView);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          id="admin-header-menu-toggle"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          title="মেনু খুলুন"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {info.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {info.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions, Live pill, Return to site */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add News Button */}
        {currentView !== 'news_add' && (
          <button
            id="admin-header-add-news-btn"
            onClick={() => onSelectView('news_add')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">নতুন সংবাদ</span>
          </button>
        )}

        {/* Live Netlify Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Netlify Live</span>
          <span className="font-mono text-[11px] text-emerald-800 font-semibold">{currentVersion}</span>
        </div>

        {/* Return to website */}
        <button
          id="admin-header-return-btn"
          onClick={onReturnToSite}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          title="ওয়েবসাইট ব্রাউজ করুন"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">পোর্টাল দেখুন</span>
          <X className="w-3.5 h-3.5 sm:hidden" />
        </button>
      </div>
    </header>
  );
};
