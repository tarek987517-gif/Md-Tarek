import React from 'react';
import { Waves, MapPin, ArrowRight, Clock } from 'lucide-react';
import { NewsArticle } from '../types';
import { timeAgoBengali } from '../lib/utils';

interface HaorSpecialSectionProps {
  newsList: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (category: string) => void;
}

export const HaorSpecialSection: React.FC<HaorSpecialSectionProps> = ({
  newsList,
  onSelectArticle,
  onSelectCategory
}) => {
  // Filter news related to Haor region (Sunamganj, Bishwambharpur, Sylhet, Agriculture)
  const haorNews = newsList.filter(
    n =>
      (n.category === 'বিশ্বম্ভরপুর' ||
        n.category === 'সুনামগঞ্জ' ||
        n.category === 'সিলেট' ||
        n.category === 'কৃষি' ||
        n.location.includes('বিশ্বম্ভরপুর') ||
        n.location.includes('সুনামগঞ্জ')) &&
      n.status === 'published'
  );

  if (haorNews.length === 0) return null;

  const leadHaor = haorNews[0];
  const otherHaor = haorNews.slice(1, 5);

  return (
    <section className="my-8 bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 text-white rounded-xl p-4 sm:p-6 shadow-md border border-cyan-800/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-cyan-800/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-600/30 rounded-lg border border-cyan-400/40">
            <Waves className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-cyan-50 font-serif">
              হাওর পরিক্রমা: সুনামগঞ্জ ও বিশ্বম্ভরপুর
            </h2>
            <p className="text-xs text-cyan-300/80">
              হাওরাঞ্চলের জনজীবন, বাঁধ সংস্কার, বোরো ফসল, কৃষি ও পর্যটনের বিশেষ প্রতিবেদন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCategory('বিশ্বম্ভরপুর')}
            className="text-xs font-semibold bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 px-3 py-1.5 rounded-md border border-cyan-700/50 transition flex items-center gap-1"
          >
            <span>বিশ্বম্ভরপুর</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectCategory('সুনামগঞ্জ')}
            className="text-xs font-semibold bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 px-3 py-1.5 rounded-md border border-cyan-700/50 transition flex items-center gap-1"
          >
            <span>সুনামগঞ্জ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Haor Feature (6 Cols) */}
        {leadHaor && (
          <div
            onClick={() => onSelectArticle(leadHaor)}
            className="lg:col-span-6 group cursor-pointer bg-slate-900/80 rounded-lg overflow-hidden border border-cyan-800/40 hover:border-cyan-500 transition duration-300 flex flex-col"
          >
            <div className="relative aspect-16/9 overflow-hidden bg-slate-800">
              <img
                src={leadHaor.featuredImage}
                alt={leadHaor.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <span className="absolute bottom-3 left-3 bg-cyan-700 text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                {leadHaor.category}
              </span>
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-cyan-200 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {leadHaor.location}
              </span>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition leading-snug mb-2 font-serif">
                  {leadHaor.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {leadHaor.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-cyan-400/80 pt-3 border-t border-slate-800">
                <span>প্রতিবেদক: {leadHaor.authorName}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeAgoBengali(leadHaor.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4 Companion Haor Stories (6 Cols) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherHaor.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="group cursor-pointer bg-slate-900/60 rounded-lg p-3 border border-cyan-800/30 hover:border-cyan-500/60 hover:bg-slate-900/90 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 rounded overflow-hidden mb-2 bg-slate-800">
                  <img
                    src={item.thumbnailImage || item.featuredImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-cyan-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {item.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug font-serif">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                <span className="truncate max-w-[120px]">{item.location}</span>
                <span>{timeAgoBengali(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
