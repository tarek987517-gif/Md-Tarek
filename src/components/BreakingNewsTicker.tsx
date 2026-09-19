import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { NewsArticle } from '../types';

interface BreakingNewsTickerProps {
  newsList: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  newsList,
  onSelectArticle
}) => {
  const breakingArticles = newsList.filter(n => n.isBreaking && n.status === 'published');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Default fallback if no news marked breaking
  const displayArticles = breakingArticles.length > 0 ? breakingArticles : newsList.slice(0, 4);

  useEffect(() => {
    if (displayArticles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayArticles.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [displayArticles.length, isPaused]);

  if (displayArticles.length === 0) return null;

  const currentArticle = displayArticles[currentIndex] || displayArticles[0];

  return (
    <div className="bg-red-50 border-y border-red-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-red-700 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded shadow-xs whitespace-nowrap select-none">
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
          <span>ব্রেকিং নিউজ</span>
        </div>

        {/* Headline Ticker Item */}
        <div
          className="flex-1 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onClick={() => onSelectArticle(currentArticle)}
        >
          <div className="flex items-center gap-2 group">
            <span className="text-[11px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded hidden sm:inline-block">
              {currentArticle.category}
            </span>
            <p className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-red-700 transition truncate">
              {currentArticle.title}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 text-gray-500">
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + displayArticles.length) % displayArticles.length)}
            aria-label="পূর্ববর্তী সংবাদ"
            className="p-1 hover:bg-red-100 hover:text-red-700 rounded transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % displayArticles.length)}
            aria-label="পরবর্তী সংবাদ"
            className="p-1 hover:bg-red-100 hover:text-red-700 rounded transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
