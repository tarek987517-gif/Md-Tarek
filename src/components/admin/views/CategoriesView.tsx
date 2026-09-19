import React, { useState } from 'react';
import { FolderTree, Plus, Trash2, CheckCircle2, AlertCircle, Newspaper } from 'lucide-react';
import { Category, NewsArticle, User } from '../../../types';
import { api } from '../../../lib/api';
import { toBengaliNumber } from '../../../lib/utils';

interface CategoriesViewProps {
  categories: Category[];
  allNews: NewsArticle[];
  currentUser: User;
  onRefreshData: () => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  allNews,
  currentUser,
  onRefreshData
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-');
      await api.createCategory({
        name: newCatName.trim(),
        slug,
        order: categories.length + 1
      });
      setNewCatName('');
      setNewCatSlug('');
      setSuccessMsg('নতুন ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!');
      await onRefreshData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" ক্যাটাগরি মুছে ফেলতে চান?`)) return;

    try {
      await api.deleteCategory(id);
      setSuccessMsg('ক্যাটাগরি মুছে ফেলা হয়েছে।');
      await onRefreshData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Category Form (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-600" />
            <span>নতুন ক্যাটাগরি যোগ</span>
          </h3>

          <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ক্যাটাগরির নাম (বাংলা) *</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="যেমন: খেলাধুলা, কৃষি ও প্রযুক্তি"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">স্লাগ (English URL Slug)</label>
              <input
                type="text"
                value={newCatSlug}
                onChange={e => setNewCatSlug(e.target.value)}
                placeholder="যেমন: sports, agriculture"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              {isSubmitting ? 'তৈরি হচ্ছে...' : 'ক্যাটাগরি যুক্ত করুন'}
            </button>
          </form>
        </div>

        {/* Existing Categories Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              <span>বিদ্যমান ক্যাটাগরি তালিকা ({toBengaliNumber(categories.length)} টি)</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {categories.map((cat, idx) => {
              const count = allNews.filter(n => n.category === cat.name).length;
              return (
                <div key={cat.id} className="p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{cat.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                      <span>{toBengaliNumber(count)} টি সংবাদ</span>
                    </span>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
