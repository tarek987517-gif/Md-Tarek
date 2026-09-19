import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Search,
  Copy,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { MediaItem, User } from '../../../types';
import { api } from '../../../lib/api';
import { compressAndResizeImage, toBengaliNumber } from '../../../lib/utils';

interface MediaLibraryViewProps {
  mediaList: MediaItem[];
  currentUser: User;
  onRefreshMedia: () => Promise<void>;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  mediaList,
  currentUser,
  onRefreshMedia
}) => {
  const isReporter = currentUser.role === 'reporter';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Filter media
  const filteredMedia = mediaList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.filename.toLowerCase().includes(q) ||
      (item.caption && item.caption.toLowerCase().includes(q)) ||
      (item.altText && item.altText.toLowerCase().includes(q))
    );
  });

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const dataUri = await compressAndResizeImage(file, 1800, 1200, 0.82);
      await api.createMedia({
        dataUri,
        filename: file.name,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        caption: ''
      });
      await onRefreshMedia();
    } catch (err: any) {
      setUploadError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Delete media
  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteMedia(id);
      if (selectedItem?.id === id) setSelectedItem(null);
      await onRefreshMedia();
    } catch (err: any) {
      alert(err.message || 'ছবি মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // Save details
  const handleSaveDetails = async () => {
    if (!selectedItem) return;
    try {
      setIsSavingDetails(true);
      await api.updateMedia(selectedItem.id, {
        caption: editCaption,
        altText: editAlt
      });
      await onRefreshMedia();
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSavingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-600" />
            <span>মিডিয়া ও ফটো লাইব্রেরি</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট {toBengaliNumber(mediaList.length)} টি ছবি ও সম্পদ সংরক্ষিত রয়েছে
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)}>✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ফাইলের নাম বা ক্যাপশন দিয়ে খুঁজুন..."
          className="w-full text-xs text-slate-800 focus:outline-none"
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            কোনো ছবি পাওয়া যায়নি।
          </div>
        ) : (
          filteredMedia.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden group hover:shadow-md transition-all flex flex-col"
            >
              {/* Image Preview */}
              <div
                onClick={() => {
                  setSelectedItem(item);
                  setEditCaption(item.caption || '');
                  setEditAlt(item.altText || '');
                }}
                className="aspect-video bg-slate-100 overflow-hidden relative cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.altText || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>বিস্তারিত</span>
                </div>
              </div>

              {/* Info & Copy bar */}
              <div className="p-2.5 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 truncate text-[11px] title={item.filename}">
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.dimensions} • {item.size}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-600 font-medium"
                    title="ছবির লিঙ্ক কপি করুন"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>লিঙ্ক কপি</span>
                      </>
                    )}
                  </button>

                  {(!isReporter || item.uploadedBy === currentUser.id) && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Image Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">ছবির তথ্য ও সম্পাদনা</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="aspect-video max-h-64 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText || ''}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ফাইলের নাম</label>
                  <p className="p-2 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">{selectedItem.filename}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ছবির লিঙ্ক (Direct URL)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="w-full p-2 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedItem.id, selectedItem.url)}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1"
                    >
                      {copiedId === selectedItem.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === selectedItem.id ? 'কপি হয়েছে' : 'কপি'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ক্যাপশন (Caption)</label>
                  <input
                    type="text"
                    value={editCaption}
                    onChange={e => setEditCaption(e.target.value)}
                    placeholder="ছবির নিচে প্রদর্শিত ক্যাপশন..."
                    className="w-full p-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অল্ট টেক্সট (Alt Text)</label>
                  <input
                    type="text"
                    value={editAlt}
                    onChange={e => setEditAlt(e.target.value)}
                    placeholder="সার্চ ইঞ্জিন ও স্ক্রিন রিডারের জন্য বিবরণ..."
                    className="w-full p-2 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
              >
                ছবি মুছে ফেলুন
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveDetails}
                  disabled={isSavingDetails}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {isSavingDetails ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
