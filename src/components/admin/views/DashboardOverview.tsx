import React from 'react';
import {
  Newspaper,
  Eye,
  FileEdit,
  Clock,
  Users,
  Flame,
  Star,
  PlusCircle,
  Rocket,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { NewsArticle, User, ActivityLog } from '../../../types';
import { AdminViewType } from '../AdminSidebar';
import { toBengaliNumber } from '../../../lib/utils';

interface DashboardOverviewProps {
  allNews: NewsArticle[];
  currentUser: User;
  onSelectView: (view: AdminViewType) => void;
  onEditArticle: (article: NewsArticle) => void;
  recentActivities: ActivityLog[];
  currentVersion?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  allNews,
  currentUser,
  onSelectView,
  onEditArticle,
  recentActivities,
  currentVersion = 'v2.5.0'
}) => {
  const isReporter = currentUser.role === 'reporter';

  // Metrics calculation
  const publishedNews = allNews.filter(n => n.status === 'published');
  const draftNews = allNews.filter(n => n.status === 'draft');
  const breakingNews = allNews.filter(n => n.isBreaking && n.status === 'published');
  const featuredNews = allNews.filter(n => n.isFeatured && n.status === 'published');

  const totalViews = allNews.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayNews = allNews.filter(n => (n.publishDate || '').startsWith(todayStr) || (n.createdAt || '').startsWith(todayStr));

  const myArticles = isReporter ? allNews.filter(n => n.authorId === currentUser.id) : allNews;
  const recentArticles = [...myArticles].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-600 text-white">
                হাওর টিভি HD CMS
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {currentVersion} • প্রোডাকশন রেডি
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              স্বাগতম, {currentUser.name}!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              {currentUser.role === 'super_admin'
                ? 'হাওর টিভি HD-এর প্রধান সম্পাদকীয় ড্যাশবোর্ড থেকে সংবাদ প্রকাশনা, প্রতিনিধি নিয়ন্ত্রণ, Adsterra বিজ্ঞাপন ও Netlify ডেপ্লয়মেন্ট পরিচালনা করুন।'
                : currentUser.role === 'editor'
                ? 'হাওর অঞ্চলের বস্তুনিষ্ঠ সংবাদ সম্পাদনা, ক্যাটাগরি ব্যবস্থাপনা ও প্রকাশনা নিয়ন্ত্রণ করুন।'
                : 'আপনার এলাকার সর্বশেষ সংবাদ ও ছবি দ্রুত ড্রাফট বা সরাসরি প্রকাশনার জন্য প্রস্তুত করুন।'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              id="dash-quick-add-btn"
              onClick={() => onSelectView('news_add')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন সংবাদ লিখুন</span>
            </button>
            <button
              id="dash-quick-media-btn"
              onClick={() => onSelectView('media')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>মিডিয়া</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/10 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Published News */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-700">মোট প্রকাশিত সংবাদ</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {toBengaliNumber(publishedNews.length)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> লাইভ পোর্টালে সক্রিয়
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5" />
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-700">মোট পাঠক ভিউ</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {toBengaliNumber(totalViews)}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> অর্গানিক রিডারশিপ
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Breaking News */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-700">ব্রেকিং নিউজ সক্রিয়</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {toBengaliNumber(breakingNews.length)}
            </h3>
            <p className="text-[11px] text-orange-600 font-medium mt-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3" /> শীর্ষ স্ক্রোলিং টিকার
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-700">ড্রাফট ও অপেক্ষমান</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {toBengaliNumber(draftNews.length)}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> পর্যালোচনার অপেক্ষায়
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Articles & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent News List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                {isReporter ? 'আমার সাম্প্রতিক প্রতিবেদন' : 'সাম্প্রতিক প্রকাশিত ও সংরক্ষিত সংবাদ'}
              </h3>
            </div>
            <button
              onClick={() => onSelectView('news_all')}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>সকল সংবাদ</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-700 text-sm">
                কোনো সংবাদ পাওয়া যায়নি।
              </div>
            ) : (
              recentArticles.map(article => (
                <div
                  key={article.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={article.thumbnailImage || article.featuredImage}
                      alt={article.title}
                      className="w-14 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-100 text-red-700 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> ব্রেকিং
                          </span>
                        )}
                        {article.status === 'draft' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                            ড্রাফট
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-1">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                        {article.authorName} • {article.location} • {toBengaliNumber(article.views || 0)} বার পঠিত
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onEditArticle(article)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      সম্পাদনা
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: System Status & Activity Feed (1 Col) */}
        <div className="space-y-6">
          {/* Quick Publishing Health Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-600" />
              <span>হোস্টিং ও ডেপ্লয়মেন্ট স্ট্যাটাস</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">হোস্টিং প্রোভাইডার</span>
                <span className="font-semibold text-slate-800">Netlify Pro CDN</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">বর্তমান সংস্করণ</span>
                <span className="font-mono font-bold text-blue-700">{currentVersion}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>লাইভ ওয়েবসাইট</span>
                </span>
                <a
                  href="https://haortvhd.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline flex items-center gap-1 text-[11px]"
                >
                  ভিজিট করুন <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {currentUser.role === 'super_admin' && (
              <button
                onClick={() => onSelectView('deployments')}
                className="w-full mt-3 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Rocket className="w-3.5 h-3.5 text-blue-400" />
                <span>ডেপ্লয়মেন্ট প্যানেল খুলুন</span>
              </button>
            )}
          </div>

          {/* Activity Log Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>সাম্প্রতিক কার্যক্রম</span>
              </h3>
              <button
                onClick={() => onSelectView('activity_logs')}
                className="text-[11px] text-red-600 hover:underline font-semibold"
              >
                সকল লগ
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivities.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span className="font-semibold text-slate-700">{log.userName}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-medium text-slate-800 text-xs">{log.action}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
