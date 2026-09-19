import React, { useState } from 'react';
import { Play, Tv, Radio, Sparkles } from 'lucide-react';

export const VideoGallerySection: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState(0);

  const videoList = [
    {
      id: 'vid-1',
      title: 'হাওর টিভি HD বুলেটিন: বিশ্বম্ভরপুর ও সুনামগঞ্জে সুরমা নদীর বাঁধ সুরক্ষার সরাসরি প্রতিবেদন',
      duration: '১০:২৫',
      views: '১২,৪৫০',
      thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80',
      time: 'আজকের প্রধান সংবাদ'
    },
    {
      id: 'vid-2',
      title: 'টাঙ্গুয়ার হাওর ডায়েরি: পরিবেশ রক্ষা ও পরিচ্ছন্ন পর্যটনের বিশেষ অনুসন্ধান',
      duration: '০৭:৪০',
      views: '৮,৯২০',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
      time: 'বিশেষ আয়োজন'
    },
    {
      id: 'vid-3',
      title: 'সুনামগঞ্জে সৌরবিদ্যুৎ চালিত সেচ প্রকল্পের মাঠপর্যায়ের সাফল্য ও কৃষকের মুখে হাসি',
      duration: '০৫:১৫',
      views: '৬,৩৪০',
      thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&auto=format&fit=crop&q=80',
      time: 'হাওর অর্থনীতি'
    }
  ];

  return (
    <section className="my-8 bg-gray-900 text-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-800">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600 rounded-lg text-white">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                হাওর টিভি HD ভিডিও বুলেটিন
              </h2>
              <span className="flex items-center gap-1 bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                <Radio className="w-2.5 h-2.5" />
                HD LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              ডিজিটাল স্টুডিও থেকে সরাসরি ভিডিও প্রতিবেদন ও বিশেষ সম্প্রচার
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Player Area */}
        <div className="lg:col-span-8">
          <div className="relative aspect-16/9 bg-black rounded-lg overflow-hidden border border-gray-800 group shadow-lg">
            <img
              src={videoList[activeVideo].thumbnail}
              alt={videoList[activeVideo].title}
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
              <div className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer transform group-hover:scale-110 transition">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
            </div>

            {/* Live Studio Watermark */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-bold text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>HAOR TV HD DIGITAL</span>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
              <span className="text-xs font-bold text-yellow-400">
                {videoList[activeVideo].time}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug mt-1 font-serif">
                {videoList[activeVideo].title}
              </h3>
            </div>
          </div>
        </div>

        {/* Playlist Thumbnails */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            আরও ভিডিও সম্প্রচার
          </span>
          {videoList.map((vid, idx) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(idx)}
              className={`group cursor-pointer p-2.5 rounded-lg flex items-center gap-3 transition border ${
                activeVideo === idx
                  ? 'bg-gray-800 border-red-600'
                  : 'bg-gray-800/40 border-gray-800 hover:bg-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="relative w-24 aspect-16/10 rounded overflow-hidden shrink-0 bg-black">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-white px-1 rounded">
                  {vid.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-200 group-hover:text-red-400 transition line-clamp-2 leading-snug font-serif">
                  {vid.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span>{vid.views} দর্শন</span>
                  <span className="text-red-400 font-medium">{vid.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
