import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { NewsArticle, Category, User } from '../../../types';
import { toBengaliNumber } from '../../../lib/utils';
import { api } from '../../../lib/api';

interface NewsListViewProps {
  filterType: 'all' | 'draft' | 'breaking' | 'featured';
  allNews: NewsArticle[];
  categories: Category[];
  currentUser: User;
  onEditArticle: (article: NewsArticle) => void;
  onAddNewNews: () => void;
  onRefreshData: () => Promise<void>;
}

export const NewsListView: React.FC<NewsListViewProps> = ({
  filterType,
  allNews,
  categories,
  currentUser,
  onEditArticle,
  onAddNewNews,
  onRefreshData
}) => {
  const isReporter = currentUser.role === 'reporter';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter pipeline
  const filteredList = useMemo(() => {
    let list = [...allNews];

    // Role check: reporter sees own news first or all depending on view
    if (isReporter && currentUser.permissions?.viewOwnNews) {
      list = list.filter(n => n.authorId === currentUser.id);
    }

    // View filter
    if (filterType === 'draft') {
      list = list.filter(n => n.status === 'draft');
    } else if (filterType === 'breaking') {
      list = list.filter(n => n.isBreaking);
    } else if (filterType === 'featured') {
      list = list.filter(n => n.isFeatured);
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(n => n.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.location.toLowerCase().includes(q) ||
          n.authorName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNews, filterType, selectedCategory, searchQuery, isReporter, currentUser]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedArticles = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Quick Toggle Status
  const handleToggleStatus = async (article: NewsArticle) => {
    try {
      setActionLoading(article.id);
      setActionError(null);
      const newStatus = article.status === 'published' ? 'draft' : 'published';
      await api.updateNews(article.id, { status: newStatus });
      await onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Toggle Breaking
  const handleToggleBreaking = async (article: NewsArticle) => {
    try {
      setActionLoading(article.id);
      setActionError(null);
      await api.updateNews(article.id, { isBreaking: !article.isBreaking });
      await onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'ব্রেকিং স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Toggle Featured
  const handleToggleFeatured = async (article: NewsArticle) => {
    try {
      setActionLoading(article.id);
      setActionError(null);
      await api.updateNews(article.id, { isFeatured: !article.isFeatured });
      await onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'শীর্ষ সংবাদ স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete handler
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছে ফেলতে চান?\n\n"${title}"`)) {
      return;
    }

    try {
      setDeletingId(id);
      setActionError(null);
      await api.deleteNews(id);
      await onRefreshData();
    } catch (err: any) {
      setActionError(err.message || 'সংবাদ মুছে ফেলতে ব্যর্থ হয়েছে।');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Notification */}
      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="শিরোনাম, বিবরণ বা সাংবাদিকের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add News Shortcut */}
          <button
            onClick={onAddNewNews}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন সংবাদ</span>
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-14">ছবি</th>
                <th className="py-3 px-4">সংবাদের শিরোনাম ও বিবরণ</th>
                <th className="py-3 px-4 hidden md:table-cell">লেখক ও অবস্থান</th>
                <th className="py-3 px-4 hidden sm:table-cell">তারিখ ও পঠিত</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">হাইলাইট</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    কোনো সংবাদ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedArticles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <img
                        src={article.thumbnailImage || article.featuredImage}
                        alt={article.title}
                        className="w-12 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {article.category}
                        </span>
                        {article.subcategory && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-50 text-slate-500 border border-slate-200">
                            {article.subcategory}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1 hover:text-red-600 cursor-pointer" onClick={() => onEditArticle(article)}>
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {article.summary}
                      </p>
                    </td>

                    {/* Author & Location */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="font-medium text-slate-800">{article.authorName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{article.location}</span>
                      </p>
                    </td>

                    {/* Date & Views */}
                    <td className="py-3 px-4 hidden sm:table-cell text-slate-600">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{article.publishDate || 'আজ'}</span>
                      </p>
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{toBengaliNumber(article.views || 0)} বার</span>
                      </p>
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(article)}
                        disabled={actionLoading === article.id}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          article.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        {article.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                      </button>
                    </td>

                    {/* Highlights (Breaking / Featured) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleBreaking(article)}
                          disabled={actionLoading === article.id}
                          className={`p-1.5 rounded-md transition-all ${
                            article.isBreaking
                              ? 'bg-red-500 text-white shadow-xs'
                              : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'
                          }`}
                          title="ব্রেকিং নিউজ টগল"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          disabled={actionLoading === article.id}
                          className={`p-1.5 rounded-md transition-all ${
                            article.isFeatured
                              ? 'bg-yellow-500 text-white shadow-xs'
                              : 'text-slate-300 hover:text-yellow-500 hover:bg-slate-100'
                          }`}
                          title="শীর্ষ সংবাদ টগল"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditArticle(article)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {(!isReporter || currentUser.permissions?.deleteOwnNews !== false) && (
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            disabled={deletingId === article.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            মোট <span className="font-bold text-slate-900">{toBengaliNumber(filteredList.length)}</span> টি সংবাদের মধ্যে{' '}
            <span className="font-semibold">{toBengaliNumber((currentPage - 1) * pageSize + 1)}</span> থেকে{' '}
            <span className="font-semibold">{toBengaliNumber(Math.min(currentPage * pageSize, filteredList.length))}</span> প্রদর্শিত
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-medium">
              {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
