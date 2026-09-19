import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Building, UserCheck, Phone, Mail, Globe } from 'lucide-react';
import { SiteSettings, User } from '../../../types';
import { api } from '../../../lib/api';

interface SiteSettingsViewProps {
  initialSettings: SiteSettings;
  currentUser: User;
  onRefreshData: () => Promise<void>;
}

export const SiteSettingsView: React.FC<SiteSettingsViewProps> = ({
  initialSettings,
  currentUser,
  onRefreshData
}) => {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      await api.updateSettings(settings);
      setSuccessMsg('পোর্টাল ও সম্পাদকীয় সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      await onRefreshData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Header with Save Button */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              <span>পোর্টাল ও সম্পাদকীয় পরিষদ সেটিংস</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              হাওর টিভি HD-এর মূল তথ্য, পদবী, ঠিকানা ও যোগাযোগ নম্বর পরিবর্তন করুন
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>

        {/* Editorial Board Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-red-600" />
            <span>সম্পাদকীয় পরিষদ ও কর্তৃপক্ষ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রধান সম্পাদক ও প্রকাশক *</label>
              <input
                type="text"
                required
                value={settings.editorAndPublisher}
                onChange={e => setSettings({ ...settings, editorAndPublisher: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">নির্বাহী সম্পাদক *</label>
              <input
                type="text"
                required
                value={settings.executiveEditor}
                onChange={e => setSettings({ ...settings, executiveEditor: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <span>যোগাযোগের ঠিকানা ও তথ্য</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">অফিস ও যোগাযোগের ঠিকানা *</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ফোন / মোবাইল *</label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ওয়েবসাইট স্লোগান</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>সামাজিক যোগাযোগ মাধ্যম ও কপিরাইট</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facebook পেজ লিঙ্ক</label>
              <input
                type="text"
                value={settings.socialLinks?.facebook || ''}
                onChange={e =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">YouTube চ্যানেল লিঙ্ক</label>
              <input
                type="text"
                value={settings.socialLinks?.youtube || ''}
                onChange={e =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">কপিরাইট নোটিশ</label>
            <input
              type="text"
              value={settings.copyrightText}
              onChange={e => setSettings({ ...settings, copyrightText: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
