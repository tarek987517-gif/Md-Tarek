import React, { useState } from 'react';
import { Clock, MapPin, TrendingUp, Eye, User } from 'lucide-react';
import { NewsArticle } from '../types';
import { timeAgoBengali, toBengaliNumber } from '../lib/utils';

interface HeroLeadSectionProps {
  newsList: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const HeroLeadSection: React.FC<HeroLeadSectionProps> = ({
  newsList,
  onSelectArticle
}) => {
  const [sidebarTab, setSidebarTab] = useState<'latest' | 'popular'>('latest');

  const published = newsList.filter(n => n.status === 'published');
  const leadArticle = published.find(n => n.isFeatured) || published[0];
  const remaining = published.filter(n => n.id !== leadArticle?.id);
  const subLeadArticles = remaining.slice(0, 4);

  const latestList = [...published].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  const popularList = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);

  if (!leadArticle) return null;

  return (
    <section className="my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Lead Story */}
          <div
            id={`lead-story-${leadArticle.id}`}
            onClick={() => onSelectArticle(leadArticle)}
            className="group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Lead Image */}
              <div className="md:col-span-7 relative overflow-hidden bg-gray-900 aspect-16/10">
                <img
                  src={leadArticle.featuredImage}
                  alt={leadArticle.imageAlt || leadArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="eager"
                />
                <div className="absolute top-3 left-3 bg-red-700 text-white font-bold text-xs px-2.5 py-1 rounded shadow">
                  {leadArticle.category}
                </div>
                {leadArticle.isBreaking && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-gray-950 font-black text-[11px] px-2 py-0.5 rounded shadow">
                    ব্রেকিং
                  </div>
                )}
              </div>

              {/* Lead Text Content */}
              <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-600" />
                      {leadArticle.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgoBengali(leadArticle.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-red-700 transition leading-snug mb-2 font-serif">
                    {leadArticle.title}
                  </h2>

                  {leadArticle.subtitle && (
                    <p className="text-xs font-medium text-red-800 mb-2 line-clamp-1">
                      {leadArticle.subtitle}
                    </p>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {leadArticle.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {leadArticle.authorName}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Eye className="w-3.5 h-3.5" />
                    {toBengaliNumber(leadArticle.views)} বার পঠিত
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Lead 4 Grid Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subLeadArticles.map(article => (
              <div
                key={article.id}
                id={`sublead-${article.id}`}
                onClick={() => onSelectArticle(article)}
                className="group cursor-pointer bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-red-300 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 rounded-md overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={article.thumbnailImage || article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug mb-2 font-serif">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                  <span>{article.location}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgoBengali(article.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
            {/* Tab Bar */}
            <div className="flex border-b border-gray-200 text-sm font-bold bg-gray-50">
              <button
                onClick={() => setSidebarTab('latest')}
                className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'latest'
                    ? 'border-red-700 text-red-700 bg-white font-extrabold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4 text-red-600" />
                <span>সর্বশেষ সংবাদ</span>
              </button>
              <button
                onClick={() => setSidebarTab('popular')}
                className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'popular'
                    ? 'border-red-700 text-red-700 bg-white font-extrabold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>সর্বাধিক পঠিত</span>
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 p-2 sm:p-3">
              {(sidebarTab === 'latest' ? latestList : popularList).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => onSelectArticle(item)}
                  className="group cursor-pointer py-2.5 px-2 hover:bg-red-50/50 rounded transition flex items-start gap-3"
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shrink-0 ${
                      index < 3
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {toBengaliNumber(index + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span className="text-red-700 font-medium">{item.category}</span>
                      <span>•</span>
                      <span>{timeAgoBengali(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
