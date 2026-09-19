import React from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Newspaper,
  BookmarkCheck,
  Flame,
  Star,
  FolderTree,
  Image as ImageIcon,
  Megaphone,
  Users,
  History,
  Rocket,
  HardDrive,
  Settings,
  LogOut,
  X,
  Radio,
  ExternalLink
} from 'lucide-react';
import { User } from '../../types';

export type AdminViewType =
  | 'dashboard'
  | 'news_all'
  | 'news_add'
  | 'news_draft'
  | 'news_breaking'
  | 'news_featured'
  | 'categories'
  | 'media'
  | 'ads'
  | 'users'
  | 'deployments'
  | 'activity_logs'
  | 'backup'
  | 'settings';

interface AdminSidebarProps {
  currentView: AdminViewType;
  onSelectView: (view: AdminViewType) => void;
  currentUser: User;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onReturnToSite: () => void;
  currentVersion?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  onReturnToSite,
  currentVersion = 'v2.5.0'
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || isSuperAdmin;
  const isEditor = currentUser.role === 'editor' || isAdmin;
  const isReporter = currentUser.role === 'reporter';

  const handleNavClick = (view: AdminViewType) => {
    onSelectView(view);
    onCloseMobile();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'সুপার অ্যাডমিন', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case 'admin':
        return { label: 'অ্যাডমিন', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'editor':
        return { label: 'সম্পাদক', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      default:
        return { label: 'সাংবাদিক / রিপোর্টার', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          id="admin-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-black text-white shadow-lg shadow-red-900/30">
              <span className="text-lg tracking-tighter">হাওর</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">হাওর টিভি HD</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-600/30 text-red-300 border border-red-500/30">
                  CMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">নিউজ পোর্টাল অ্যাডমিন প্যানেল</p>
            </div>
          </div>

          <button
            id="admin-sidebar-close-btn"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="মেনু বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Site & Status Quick Bar */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs">
          <button
            onClick={onReturnToSite}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:underline group"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
            <span>ওয়েবসাইট দেখুন</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{currentVersion}</span>
          </div>
        </div>

        {/* Navigation Menus List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar text-sm">
          {/* Section 1: মূল ড্যাশবোর্ড */}
          <div>
            <button
              id="menu-dashboard"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>ড্যাশবোর্ড ওভারভিউ</span>
            </button>
          </div>

          {/* Section 2: সংবাদ ও সম্পাদকীয় ব্যবস্থাপনা */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              সংবাদ ব্যবস্থাপনা
            </div>

            <button
              id="menu-news-add"
              onClick={() => handleNavClick('news_add')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'news_add'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>নতুন সংবাদ যোগ করুন</span>
            </button>

            <button
              id="menu-news-all"
              onClick={() => handleNavClick('news_all')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'news_all'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Newspaper className="w-4 h-4 shrink-0" />
              <span>সকল প্রকাশিত সংবাদ</span>
            </button>

            <button
              id="menu-news-draft"
              onClick={() => handleNavClick('news_draft')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'news_draft'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>ড্রাফট ও পেন্ডিং সংবাদ</span>
            </button>

            <button
              id="menu-news-breaking"
              onClick={() => handleNavClick('news_breaking')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'news_breaking'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0 text-orange-500" />
              <span>ব্রেকিং নিউজ নিয়ন্ত্রণ</span>
            </button>

            <button
              id="menu-news-featured"
              onClick={() => handleNavClick('news_featured')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'news_featured'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 shrink-0 text-yellow-400" />
              <span>শীর্ষ ও লিড সংবাদ</span>
            </button>

            {isEditor && (
              <button
                id="menu-categories"
                onClick={() => handleNavClick('categories')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'categories'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <FolderTree className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>ক্যাটাগরি ও বিষয়সমূহ</span>
              </button>
            )}
          </div>

          {/* Section 3: মাল্টিমিডিয়া ও গ্যালারি */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              মাল্টিমিডিয়া
            </div>

            <button
              id="menu-media"
              onClick={() => handleNavClick('media')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                currentView === 'media'
                  ? 'bg-red-600/90 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>মিডিয়া লাইব্রেরি ও ছবি</span>
            </button>
          </div>

          {/* Section 4: বিজ্ঞাপন ও মনিটাইজেশন */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                মনিটাইজেশন
              </div>

              <button
                id="menu-ads"
                onClick={() => handleNavClick('ads')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'ads'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0 text-pink-400" />
                <span>Adsterra বিজ্ঞাপন স্লট</span>
              </button>
            </div>
          )}

          {/* Section 5: সাংবাদিক ও ইউজার ম্যানেজমেন্ট */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                টিম ও নিরাপত্তা
              </div>

              <button
                id="menu-users"
                onClick={() => handleNavClick('users')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'users'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0 text-violet-400" />
                <span>রিপোর্টার ও অ্যাডমিন ব্যবস্থাপনা</span>
              </button>
            </div>
          )}

          {/* Section 6: সিস্টেম, ডেপ্লয়মেন্ট ও হিস্ট্রি */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              সিস্টেম ও প্রকাশনা
            </div>

            {isAdmin && (
              <button
                id="menu-deployments"
                onClick={() => handleNavClick('deployments')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'deployments'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Rocket className="w-4 h-4 shrink-0 text-blue-400" />
                <span>Netlify ডেপ্লয়মেন্ট ও রোলব্যাক</span>
              </button>
            )}

            {isEditor && (
              <button
                id="menu-activity-logs"
                onClick={() => handleNavClick('activity_logs')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'activity_logs'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-teal-400" />
                <span>অ্যাক্টিভিটি ও অডিট লগ</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                id="menu-backup"
                onClick={() => handleNavClick('backup')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'backup'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <HardDrive className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>ডাটাবেজ ব্যাকআপ ও রিস্টোর</span>
              </button>
            )}

            {isAdmin && (
              <button
                id="menu-settings"
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all ${
                  currentView === 'settings'
                    ? 'bg-red-600/90 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                <span>পোর্টাল ও সম্পাদকীয় সেটিংস</span>
              </button>
            )}
          </div>
        </nav>

        {/* User Profile Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[10px] font-medium rounded border ${roleInfo.bg}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="admin-sidebar-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
              title="লগআউট করুন"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
