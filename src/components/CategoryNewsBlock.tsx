import React from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { NewsArticle } from '../types';
import { timeAgoBengali } from '../lib/utils';

interface CategoryNewsBlockProps {
  categoryName: string;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryNewsBlock: React.FC<CategoryNewsBlockProps> = ({
  categoryName,
  articles,
  onSelectArticle,
  onSelectCategory
}) => {
  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <section className="my-6 bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-xs">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-red-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-red-700 rounded-xs"></span>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
            {categoryName}
          </h2>
        </div>

        <button
          onClick={() => onSelectCategory(categoryName)}
          className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 hover:underline transition"
        >
          <span>সব খবর</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Layout: 1 Lead on left + 3 in stack or grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Lead Item (7 cols) */}
        {mainArticle && (
          <div
            onClick={() => onSelectArticle(mainArticle)}
            className="md:col-span-6 lg:col-span-5 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 rounded-md overflow-hidden bg-gray-100 mb-3">
                <img
                  src={mainArticle.thumbnailImage || mainArticle.featuredImage}
                  alt={mainArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600" />
                  {mainArticle.location}
                </span>
                <span>•</span>
                <span>{timeAgoBengali(mainArticle.createdAt)}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-700 transition leading-snug mb-2 font-serif">
                {mainArticle.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {mainArticle.summary}
              </p>
            </div>
          </div>
        )}

        {/* 3 Secondary Items (5-7 cols) */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-col divide-y divide-gray-100">
          {otherArticles.map(article => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-gray-50/70 rounded px-1 transition"
            >
              <div className="w-24 sm:w-28 aspect-16/10 rounded overflow-hidden shrink-0 bg-gray-100">
                <img
                  src={article.thumbnailImage || article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug font-serif">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                  <span>{article.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgoBengali(article.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
