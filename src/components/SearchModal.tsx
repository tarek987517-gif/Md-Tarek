import React, { useState } from 'react';
import { Search, X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { NewsArticle, Category } from '../types';
import { timeAgoBengali, toBengaliNumber } from '../lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  newsList: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  newsList,
  onSelectArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  if (!isOpen) return null;

  const filtered = newsList.filter(article => {
    const q = searchTerm.toLowerCase().trim();
    const matchCat = !selectedCat || article.category === selectedCat;
    if (!q) return matchCat;

    const matchText =
      article.title.toLowerCase().includes(q) ||
      (article.subtitle && article.subtitle.toLowerCase().includes(q)) ||
      article.summary.toLowerCase().includes(q) ||
      article.content.toLowerCase().includes(q) ||
      article.location.toLowerCase().includes(q) ||
      article.authorName.toLowerCase().includes(q) ||
      (article.tags && article.tags.some(t => t.toLowerCase().includes(q)));

    return matchCat && matchText;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[80vh]">
        {/* Header Search Input */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-red-700 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="সংবাদ অনুসন্ধান করুন (শিরোনাম, ট্যাগ, লেখক, স্থান, বিষয়)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-base sm:text-lg text-gray-900 focus:outline-none placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="font-semibold text-gray-400 shrink-0">ক্যাটাগরি:</span>
            <button
              onClick={() => setSelectedCat('')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                selectedCat === '' ? 'bg-red-700 text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              সকল
            </button>
            {categories.slice(0, 8).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.name)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                  selectedCat === c.name ? 'bg-red-700 text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <span className="text-gray-400 shrink-0 pl-2">
            {toBengaliNumber(filtered.length)} টি ফলাফল
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 divide-y divide-gray-100 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm">কোনো সংবাদ পাওয়া যায়নি।</p>
              <p className="text-xs mt-1">অন্য কোনো কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectArticle(item);
                  onClose();
                }}
                className="group cursor-pointer py-3.5 flex items-start gap-4 hover:bg-red-50/50 p-2 rounded-lg transition"
              >
                <div className="w-24 sm:w-28 aspect-16/10 rounded-md overflow-hidden shrink-0 bg-gray-100">
                  <img
                    src={item.thumbnailImage || item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                    <span className="font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span>•</span>
                    <span>{timeAgoBengali(item.createdAt)}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-red-700 transition leading-snug line-clamp-2">
                    {item.title}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                    {item.summary}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-700 shrink-0 self-center hidden sm:block" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
