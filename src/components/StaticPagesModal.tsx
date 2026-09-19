import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, CheckCircle2, Shield, FileText, Info } from 'lucide-react';
import { SiteSettings } from '../types';

interface StaticPagesModalProps {
  pageKey: 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | null;
  onClose: () => void;
  siteSettings: SiteSettings;
}

export const StaticPagesModal: React.FC<StaticPagesModalProps> = ({
  pageKey,
  onClose,
  siteSettings
}) => {
  const [formSent, setFormSent] = useState(false);

  if (!pageKey) return null;

  const titles: Record<string, string> = {
    about: 'আমাদের সম্পর্কে (About Us)',
    contact: 'যোগাযোগ (Contact Us)',
    privacy: 'গোপনীয়তা নীতি (Privacy Policy)',
    terms: 'ব্যবহারের শর্তাবলী (Terms & Conditions)',
    disclaimer: 'দায়মুক্তি (Disclaimer)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 my-8">
        {/* Modal Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold">{titles[pageKey]}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
          {pageKey === 'about' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded-r">
                <h4 className="font-bold text-red-900 text-base mb-1">
                  হাওর টিভি HD - সত্যের সন্ধানে নির্ভীক কণ্ঠস্বর
                </h4>
                <p className="text-xs text-red-800">
                  সুনামগঞ্জের বিশ্বম্ভরপুর থেকে পরিচালিত বাংলাদেশের সর্বাধুনিক ডিজিটাল মাল্টিমিডিয়া সংবাদ মাধ্যম।
                </p>
              </div>

              <p>
                <strong>হাওর টিভি HD</strong> একটি স্বাধীন, নিরপেক্ষ এবং দায়িত্বশীল গণমাধ্যম। আমাদের মূল লক্ষ্য হাওরাঞ্চলের অবহেলিত মানুষ, কৃষক, জেলে এবং প্রান্তিক জনগোষ্ঠীর ন্যায্য অধিকার তুলে ধরার পাশাপাশি জাতীয় ও আন্তর্জাতিক অঙ্গনের তাজা সংবাদ সবার আগে সঠিক তথ্যের সাথে পরিবেশন করা।
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-900">সম্পাদনা ও পরিচালনা পরিষদ:</h5>
                <p><strong>প্রধান সম্পাদক ও প্রকাশক:</strong> {siteSettings.editorAndPublisher}</p>
                <p><strong>নির্বাহী সম্পাদক:</strong> {siteSettings.executiveEditor}</p>
                <p><strong>কেন্দ্রীয় কার্যালয়:</strong> {siteSettings.address}</p>
                <p><strong>যোগাযোগ:</strong> {siteSettings.phone}</p>
              </div>
            </div>
          )}

          {pageKey === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-base">আমাদের কার্যালয়</h4>
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-800">ঠিকানা:</strong>
                      <span>{siteSettings.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-800">জরুরি ফোন / হোয়াটসঅ্যাপ:</strong>
                      <a href={`tel:${siteSettings.phone}`} className="text-red-700 font-semibold hover:underline">
                        {siteSettings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-800">ইমেইল:</strong>
                      <a href={`mailto:${siteSettings.email}`} className="text-gray-800 hover:underline">
                        {siteSettings.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                  <span className="font-semibold text-gray-800 block mb-1">বিজ্ঞাপন ও সংবাদ পাঠানো:</span>
                  <p className="text-gray-500">
                    যেকোনো ধরনের বিজ্ঞাপন প্রকাশ, নিউজ বিজ্ঞপ্তি অথবা অনুসন্ধানী তথ্য পাঠানোর জন্য সরাসরি যোগাযোগ করুন।
                  </p>
                </div>
              </div>

              {/* Message form */}
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-2">সরাসরি বার্তা পাঠান</h4>
                {formSent ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>আপনার বার্তা সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!</span>
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setFormSent(true);
                      setTimeout(() => setFormSent(false), 5000);
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">আপনার নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="পুরো নাম"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">মোবাইল বা ইমেইল *</label>
                      <input
                        type="text"
                        required
                        placeholder="যোগাযোগের মাধ্যম"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">বার্তার বিষয়বস্তু *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded text-xs transition"
                    >
                      বার্তা পাঠান
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {pageKey === 'privacy' && (
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-sm">হাওর টিভি HD গোপনীয়তা নীতিমালা</h4>
              <p>
                হাওর টিভি HD (haortvhd.com) ব্যবহারকারীদের ব্যক্তিগত তথ্যের সুরক্ষাকে সর্বোচ্চ অগ্রাধিকার দেয়। এই নীতিমালায় আমরা ব্যাখ্যা করি কীভাবে আপনার তথ্য সংগ্রহ, সংরক্ষণ ও ব্যবহার করা হয়।
              </p>
              <h5 className="font-semibold text-gray-800 pt-2">তথ্য সংগ্রহ:</h5>
              <p>
                আপনি যখন আমাদের নিউজ পোর্টালে মন্তব্য করেন, নিউজলেটার সাবস্ক্রাইব করেন অথবা যোগাযোগ ফরম পূরণ করেন, তখন আপনার নাম ও ইমেইল সংরক্ষিত হতে পারে। এই তথ্য তৃতীয় কোনো পক্ষের কাছে বিক্রি বা অপব্যবহার করা হয় না।
              </p>
              <h5 className="font-semibold text-gray-800 pt-2">কুকিজ ও বিজ্ঞাপন:</h5>
              <p>
                ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে এবং মানসম্মত বিজ্ঞাপন প্রদর্শনের উদ্দেশ্যে আমরা আধুনিক কুকিজ ও অ্যাড পার্টনার নেটওয়ার্ক (যেমন Adsterra) ব্যবহার করতে পারি।
              </p>
            </div>
          )}

          {pageKey === 'terms' && (
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-sm">ব্যবহারের শর্তাবলী</h4>
              <p>
                ১. হাওর টিভি HD-তে প্রকাশিত সকল সংবাদ, ছবি, ভিডিও ও গ্রাফিক্সের স্বত্বাধিকার হাওর টিভি HD কর্তৃপক্ষের। বিনা অনুমতিতে কোনো উপাদান বাণিজ্যিকভাবে পুনঃপ্রকাশ আইনত দণ্ডনীয়।
              </p>
              <p>
                ২. পাঠকদের মন্তব্য তাদের নিজস্ব মতামত। কোনো বিভ্রান্তিকর, আক্রমণাত্মক, বা রাষ্ট্রবিরোধী মন্তব্য কর্তৃপক্ষ অনুমোদন করে না এবং কর্তৃপক্ষ মুছে ফেলার ক্ষমতা রাখে।
              </p>
            </div>
          )}

          {pageKey === 'disclaimer' && (
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-sm">দায়মুক্তি বিবৃতি (Disclaimer)</h4>
              <p>
                হাওর টিভি HD সর্বদা সঠিক এবং নিরপেক্ষ সংবাদ পরিবেশনে অঙ্গীকারবদ্ধ। মাঠ পর্যায়ের সংবাদের কোনো অনিচ্ছাকৃত তথ্যগত ভুলের ক্ষেত্রে সংশোধনী প্রকাশ করা হয়। কোনো তৃতীয় পক্ষের বহিরাগত ওয়েবসাইটের লিংকের জন্য হাওর টিভি HD দায়ী নয়।
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-1.5 rounded text-xs transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
