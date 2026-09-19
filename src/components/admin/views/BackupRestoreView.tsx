import React, { useState, useRef } from 'react';
import { HardDrive, Download, Upload, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { User } from '../../../types';
import { api } from '../../../lib/api';

interface BackupRestoreViewProps {
  currentUser: User;
  onRefreshData: () => Promise<void>;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ currentUser, onRefreshData }) => {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      setStatusMsg(null);
      const data = await api.getBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `haor_tv_hd_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMsg({ text: 'ডাটাবেজের পূর্ণাঙ্গ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!', type: 'success' });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'ব্যাকআপ ডাউনলোডে ত্রুটি ঘটেছে।', type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('সতর্কতা: ডাটাবেজ রিস্টোর করলে বর্তমান সমস্ত সংবাদ, ক্যাটাগরি ও সেটিংস ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setRestoring(true);
      setStatusMsg(null);
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await api.restoreBackup(parsed);
      setStatusMsg({
        text: `ডাটাবেজ সফলভাবে রিস্টোর হয়েছে! ${res.newsCount}টি সংবাদ ও ${res.categoriesCount}টি ক্যাটাগরি লোড হয়েছে।`,
        type: 'success'
      });
      await onRefreshData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'রিস্টোর করতে সমস্যা হয়েছে। ফাইল ফরম্যাট সঠিক নয়।', type: 'error' });
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-600" />
          <span>ডাটাবেজ ব্যাকআপ ও রিস্টোর (Super Admin)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          হাওর টিভি HD-এর সংবাদ, ক্যাটাগরি, মিডিয়া, ইউজার এবং সেটিংসের নিরাপদ অফলাইন ব্যাকআপ রাখুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Backup Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              একটি ক্লিকেই আপনার পোর্টালের সকল সংবাদ, বিজ্ঞাপন সেটিংস এবং ব্যবহারকারীদের এনক্রিপ্টেড ডাটা JSON ফরম্যাটে ডাউনলোড করে নিরাপদে সংরক্ষণ করুন।
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{downloading ? 'ব্যাকআপ প্রস্তুত হচ্ছে...' : 'ব্যাকআপ ফাইল ডাউনলোড করুন (.json)'}</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">ডাটাবেজ রিস্টোর (Restore Database)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              পূর্বে ডাউনলোড করা কোনো JSON ব্যাকআপ ফাইল আপলোড করে হাওর টিভি HD-এর সম্পূর্ণ ডাটাবেজকে পূর্ববর্তী অবস্থায় ফিরিয়ে আনুন।
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoring}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {restoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{restoring ? 'ডাটাবেজ রিস্টোর হচ্ছে...' : 'ব্যাকআপ ফাইল আপলোড ও রিস্টোর'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
