import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Youtube, 
  Twitter, 
  ArrowUp, 
  Tv, 
  ShieldCheck 
} from 'lucide-react';
import { SiteSettings, Category, AdItem } from '../types';
import { AdsterraSlot } from './AdsterraSlot';

interface FooterProps {
  siteSettings: SiteSettings;
  categories: Category[];
  footerAd?: AdItem;
  onSelectCategory: (categoryName: string) => void;
  onOpenStaticModal: (pageKey: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer') => void;
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  siteSettings,
  categories,
  footerAd,
  onSelectCategory,
  onOpenStaticModal,
  onOpenLogin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-gray-300 pt-8 pb-6 border-t-4 border-red-700">
      {/* Footer Banner Ad Slot */}
      {footerAd && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <AdsterraSlot ad={footerAd} slotLabel="ফুটার ব্যানার বিজ্ঞাপন (৭২৮x৯০)" className="!my-0" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-gray-800">
          {/* Col 1: Brand & Editorial Board (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-10 bg-red-700 rounded-lg text-white font-black shadow">
                <span className="text-xs font-bold text-yellow-300">হাওর</span>
                <span className="text-xs font-black ml-0.5 text-white">HD</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {siteSettings.siteName}
                </h3>
                <p className="text-xs text-red-400 font-medium">
                  {siteSettings.siteTagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {siteSettings.footerText}
            </p>

            {/* Editorial Information */}
            <div className="bg-gray-900/90 rounded-lg p-3.5 border border-gray-800 space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px]">প্রধান সম্পাদক ও প্রকাশক</span>
                <span className="text-white font-bold text-sm">{siteSettings.editorAndPublisher}</span>
              </div>
              <div className="pt-1.5 border-t border-gray-800">
                <span className="text-gray-500 block text-[11px]">নির্বাহী সম্পাদক</span>
                <span className="text-gray-200 font-semibold">{siteSettings.executiveEditor}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span>জনপ্রিয় ক্যাটাগরি</span>
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
              {categories.slice(0, 12).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className="text-left text-gray-400 hover:text-red-400 transition truncate"
                >
                  • {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Useful Links & Policies (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span>প্রয়োজনীয় পাতা</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenStaticModal('about')}
                  className="text-gray-400 hover:text-white transition"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenStaticModal('contact')}
                  className="text-gray-400 hover:text-white transition"
                >
                  যোগাযোগ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenStaticModal('privacy')}
                  className="text-gray-400 hover:text-white transition"
                >
                  গোপনীয়তা নীতি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenStaticModal('terms')}
                  className="text-gray-400 hover:text-white transition"
                >
                  ব্যবহারের শর্তাবলী
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenStaticModal('disclaimer')}
                  className="text-gray-400 hover:text-white transition"
                >
                  দায়মুক্তি (Disclaimer)
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenLogin}
                  className="text-red-400 hover:text-red-300 transition flex items-center gap-1 font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>অ্যাডমিন ও রিপোর্টার লগইন</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              <span>যোগাযোগের ঠিকানা</span>
            </h4>

            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`tel:${siteSettings.phone}`} className="text-white hover:text-red-400 font-semibold">
                  {siteSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${siteSettings.email}`} className="text-gray-300 hover:text-white">
                  {siteSettings.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block mb-2 font-medium">
                সামাজিক যোগাযোগ মাধ্যম
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={siteSettings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 transition"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={siteSettings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 transition"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href={siteSettings.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-300 hover:text-white hover:bg-sky-500 transition"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Scroll to top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>{siteSettings.copyrightText}</p>

          <button
            onClick={scrollToTop}
            aria-label="শীর্ষে যান"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white bg-gray-900 hover:bg-red-700 px-3 py-1.5 rounded transition text-xs"
          >
            <span>উপরে যান</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
