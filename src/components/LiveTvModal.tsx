import React, { useState } from 'react';
import { X, Tv, Volume2, VolumeX, Maximize, Radio, Share2, Sparkles } from 'lucide-react';

interface LiveTvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTvModal: React.FC<LiveTvModalProps> = ({ isOpen, onClose }) => {
  const [muted, setMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-950 text-white w-full max-w-4xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex flex-col">
        {/* Stream Header */}
        <div className="px-5 py-3.5 bg-gray-900 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded shadow animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>হাওর টিভি HD লাইভ সম্প্রচার</span>
                <span className="text-[10px] bg-yellow-400 text-gray-950 font-black px-1.5 py-0.2 rounded">1080p</span>
              </h3>
              <p className="text-[11px] text-gray-400">বিশ্বম্ভরপুর ও সুনামগঞ্জ স্টুডিও থেকে সরাসরি ডিজিটাল সম্প্রচার</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="relative aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
          {/* Stream background preview */}
          <img
            src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80"
            alt="হাওর টিভি লাইভ"
            className="w-full h-full object-cover opacity-80"
          />

          {/* Overlay Graphics */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-red-500 border border-red-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span>HAOR TV HD 24/7 ON AIR</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md text-xs text-yellow-400 font-semibold border border-yellow-400/20">
            দর্শক: ১,৪২০ জন দেখছেন
          </div>

          {/* Center Play indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center text-white shadow-xl animate-pulse">
              <Tv className="w-8 h-8" />
            </div>
            <p className="mt-3 text-sm font-semibold text-white drop-shadow-md">
              সরাসরি ডিজিটাল স্টুডিও ফিড
            </p>
          </div>

          {/* Bottom live ticker on stream */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wide">
                চলতি অনুষ্ঠান
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                হাওরের বার্তা: বিশ্বম্ভরপুর ও সুনামগঞ্জ বিশেষ সংবাদ বুলেটিন
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Schedule & Info */}
        <div className="p-4 bg-gray-900/70 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            <span className="font-bold text-gray-200">পরবর্তী অনুষ্ঠান:</span> রাত ৯:০০ টায় "হাওর কথা: কৃষি ও পর্যটন ডায়ালগ"
          </div>
          <div className="text-gray-400">
            সম্প্রচার কেন্দ্র: বিশ্বম্ভরপুর 3000, সুনামগঞ্জ, বাংলাদেশ
          </div>
        </div>
      </div>
    </div>
  );
};
