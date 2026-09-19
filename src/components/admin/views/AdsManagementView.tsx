import React, { useState } from 'react';
import {
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Code2,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { AdSettings, AdItem, User } from '../../../types';
import { api } from '../../../lib/api';

interface AdsManagementViewProps {
  initialAds: AdSettings;
  currentUser: User;
  onRefreshData: () => Promise<void>;
}

export const AdsManagementView: React.FC<AdsManagementViewProps> = ({
  initialAds,
  currentUser,
  onRefreshData
}) => {
  const [ads, setAds] = useState<AdSettings>(initialAds);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<keyof AdSettings>('headerBanner');

  const updateSlot = (key: keyof AdSettings, fields: Partial<AdItem>) => {
    setAds(prev => {
      const existing: AdItem = prev[key] || { enabled: false, code: '' };
      return {
        ...prev,
        [key]: {
          ...existing,
          ...fields,
          enabled: fields.enabled !== undefined ? fields.enabled : existing.enabled,
          code: fields.code !== undefined ? fields.code : existing.code
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      await api.updateAds(ads);
      setSuccessMsg('Adsterra বিজ্ঞাপনের সকল স্লট সফলভাবে আপডেট হয়েছে!');
      await onRefreshData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'বিজ্ঞাপন সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  const adSlots: { key: keyof AdSettings; title: string; size: string; desc: string }[] = [
    { key: 'headerBanner', title: 'হেডার ব্যানার (Header Ad)', size: '728x90 বা 300x100 মোবাইল', desc: 'ওয়েবসাইটের মূল মেনুর ঠিক নিচে প্রদর্শিত হয়।' },
    { key: 'sidebarBanner', title: 'সাইডবার শীর্ষ বিজ্ঞাপন (Sidebar Top)', size: '300x250 বা 300x600', desc: 'হোমপেজ ও প্রতিটি সংবাদের ডানপাশের সাইডবারে সবার উপরে থাকে।' },
    { key: 'inArticleBanner', title: 'সংবাদের ভেতরের ব্যানার (Inside Article)', size: '728x90 বা 300x250', desc: 'সংবাদের দ্বিতীয় বা তৃতীয় প্যারাগ্রাফের ঠিক নিচে অটো-ইনসার্ট হয়।' },
    { key: 'homepageBanner', title: 'হোমপেজ মধ্যবর্তী ব্যানার (Homepage Grid)', size: '970x90 বা 728x90', desc: 'ক্যাটাগরি ব্লকের মাঝে দৃষ্টিগ্রাহ্যভাবে প্রদর্শিত হয়।' },
    { key: 'footerBanner', title: 'ফুটার ব্যানার (Footer Banner)', size: '728x90', desc: 'ওয়েবসাইটের ফুটারের ঠিক উপরে প্রদর্শিত হয়।' },
    { key: 'socialBar', title: 'সোশ্যাল বার বিজ্ঞাপন (Social Bar)', size: 'Mobile / Desktop Sticky Bar', desc: 'স্ক্রিনের নিচে ভাসমান সোশ্যাল বার বিজ্ঞাপন।' },
    { key: 'popunder', title: 'পপআন্ডার ডিরেক্ট লিঙ্ক (Popunder / Direct Link)', size: 'Full-page / Overlay Script', desc: 'Adsterra Direct link বা Popunder কোড প্রদর্শনের জন্য।' }
  ];

  const currentSlotData = ads[activeSlot];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-pink-600" />
            <span>Adsterra বিজ্ঞাপন ব্যবস্থাপনা</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Adsterra কোড ও সরাসরি ব্যানার বিজ্ঞাপন নিয়ন্ত্রণের পূর্ণাঙ্গ ইঞ্জিন
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সকল বিজ্ঞাপন সেভ করুন'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Slot List (Left) vs Slot Configuration (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Slots Nav */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 space-y-1">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            বিজ্ঞাপন স্লট নির্বাচন করুন
          </p>

          {adSlots.map(slot => {
            const isEnabled = ads[slot.key]?.enabled;
            const isSelected = activeSlot === slot.key;

            return (
              <button
                key={slot.key}
                onClick={() => setActiveSlot(slot.key)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold leading-tight">{slot.title}</h4>
                  <p className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {slot.size}
                  </p>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                    isEnabled
                      ? isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isSelected
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isEnabled ? 'চালু' : 'বন্ধ'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Slot Detail Editor */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {adSlots.find(s => s.key === activeSlot)?.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {adSlots.find(s => s.key === activeSlot)?.desc}
              </p>
            </div>

            {/* Enable / Disable Switch */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={currentSlotData?.enabled || false}
                onChange={e => updateSlot(activeSlot, { enabled: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-xs font-bold text-slate-800">স্লট সক্রিয় রাখুন</span>
            </label>
          </div>

          {/* Adsterra Code Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-pink-600" />
                <span>Adsterra স্ক্রিপ্ট / HTML কোড</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                &lt;script&gt; বা &lt;iframe&gt; ট্যাগ
              </span>
            </label>
            <textarea
              rows={5}
              value={currentSlotData?.code || ''}
              onChange={e => updateSlot(activeSlot, { code: e.target.value })}
              placeholder="<!-- Adsterra Code paste here -->"
              className="w-full p-3 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-950 text-emerald-400"
            />
          </div>

          {/* Image Banner Fallback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>বিকল্প বিজ্ঞাপন ব্যানার (Fallback Banner Image & Link)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              অ্যাডব্লকার থাকলে বা Adsterra স্ক্রিপ্ট লোড না হলে পাঠকদের এই সুন্দর ব্যানার ও লিঙ্ক প্রদর্শিত হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্যানার ছবির লিঙ্ক (Image URL)</label>
                <input
                  type="text"
                  value={currentSlotData?.imageUrl || ''}
                  onChange={e => updateSlot(activeSlot, { imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ক্লিক করার গন্তব্য (Redirect URL)</label>
                <input
                  type="text"
                  value={currentSlotData?.link || ''}
                  onChange={e => updateSlot(activeSlot, { link: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            {currentSlotData?.imageUrl && (
              <div className="pt-2">
                <p className="font-semibold text-slate-600 text-[11px] mb-1">ব্যানার প্রিভিউ:</p>
                <div className="rounded-lg overflow-hidden border border-slate-300 bg-white p-2">
                  <img
                    src={currentSlotData.imageUrl}
                    alt="Ad banner preview"
                    className="max-h-24 w-auto mx-auto object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
