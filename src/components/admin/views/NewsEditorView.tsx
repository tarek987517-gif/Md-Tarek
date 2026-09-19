import React, { useState, useRef, useEffect } from 'react';
import {
  Save,
  Eye,
  Edit3,
  Upload,
  Image as ImageIcon,
  Flame,
  Star,
  Globe,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Link2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { NewsArticle, Category, User, MediaItem, NewsStatus } from '../../../types';
import { api } from '../../../lib/api';
import { compressAndResizeImage } from '../../../lib/utils';

interface NewsEditorViewProps {
  initialArticle?: NewsArticle | null;
  categories: Category[];
  currentUser: User;
  onSaveSuccess: (article: NewsArticle) => void;
  onCancel: () => void;
  mediaList?: MediaItem[];
}

export const NewsEditorView: React.FC<NewsEditorViewProps> = ({
  initialArticle,
  categories,
  currentUser,
  onSaveSuccess,
  onCancel,
  mediaList = []
}) => {
  const isEditing = Boolean(initialArticle);
  const isReporter = currentUser.role === 'reporter';
  const canPublishDirectly = !isReporter || currentUser.permissions?.publishNews !== false;

  // Main fields
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '');
  const [category, setCategory] = useState(initialArticle?.category || categories[0]?.name || 'জাতীয়');
  const [subcategory, setSubcategory] = useState(initialArticle?.subcategory || '');
  const [location, setLocation] = useState(initialArticle?.location || 'বিশ্বম্ভরপুর, সুনামগঞ্জ');
  const [summary, setSummary] = useState(initialArticle?.summary || '');
  const [content, setContent] = useState(initialArticle?.content || '');

  // Media
  const [featuredImage, setFeaturedImage] = useState(
    initialArticle?.featuredImage || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80'
  );
  const [imageCaption, setImageCaption] = useState(initialArticle?.imageCaption || '');
  const [imageAlt, setImageAlt] = useState(initialArticle?.imageAlt || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // SEO & Tags
  const [tags, setTags] = useState(
    Array.isArray(initialArticle?.tags) ? initialArticle?.tags.join(', ') : initialArticle?.tags || ''
  );
  const [focusKeyword, setFocusKeyword] = useState(initialArticle?.focusKeyword || '');
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription || '');

  // Attributes
  const [status, setStatus] = useState<NewsStatus>(
    initialArticle?.status || (canPublishDirectly ? 'published' : 'draft')
  );
  const [isBreaking, setIsBreaking] = useState(Boolean(initialArticle?.isBreaking));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialArticle?.isFeatured));
  const [isHomepageFeatured, setIsHomepageFeatured] = useState(Boolean(initialArticle?.isHomepageFeatured));
  const [allowComments, setAllowComments] = useState(initialArticle?.allowComments !== false);

  // UI state
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill SEO Title & Description if empty
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(`${title} - হাওর টিভি HD`);
    }
  }, [title]);

  useEffect(() => {
    if (!seoDescription && summary) {
      setSeoDescription(summary.slice(0, 160));
    }
  }, [summary]);

  // Handle rich toolbar commands
  const applyFormatting = (tagStart: string, tagEnd: string = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = `${tagStart}${selectedText || 'টেক্সট'}${tagEnd}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selectedText.length || 6));
    }, 0);
  };

  // Image Upload handler with client compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setErrorMsg(null);
      // Compress and convert to high-efficiency WebP/JPEG data URI
      const compressedDataUri = await compressAndResizeImage(file, 1600, 1000, 0.82);
      const res = await api.uploadImage(compressedDataUri, file.name);
      setFeaturedImage(res.url);
      if (!imageAlt) setImageAlt(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      setErrorMsg(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save handler
  const handleSave = async (forceStatus?: 'published' | 'draft') => {
    if (!title.trim()) {
      setErrorMsg('সংবাদের শিরোনাম প্রদান করুন।');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('সংবাদের বিস্তারিত বিবরণ প্রদান করুন।');
      return;
    }

    const effectiveStatus = forceStatus || status;

    setIsSaving(true);
    setErrorMsg(null);

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload: Partial<NewsArticle> = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      subcategory: subcategory.trim(),
      location: location.trim(),
      summary: summary.trim() || content.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...',
      content,
      featuredImage: featuredImage.trim(),
      thumbnailImage: featuredImage.trim(),
      imageCaption: imageCaption.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      tags: tagArray,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || summary.trim(),
      metaKeywords: tagArray.join(', '),
      focusKeyword: focusKeyword.trim(),
      status: effectiveStatus,
      isBreaking,
      isFeatured,
      isHomepageFeatured,
      allowComments
    };

    try {
      if (isEditing && initialArticle) {
        const res = await api.updateNews(initialArticle.id, payload);
        onSaveSuccess(res.article);
      } else {
        const res = await api.createNews(payload);
        onSaveSuccess(res.article);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'সংবাদ সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'সংবাদ সম্পাদনা করুন' : 'নতুন সংবাদ রচনা'}
          </h2>
          <p className="text-xs text-slate-500">
            {isEditing ? `আইডি: ${initialArticle?.id}` : 'হাওর টিভি HD-এর জন্য সংবাদ তৈরি করুন'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            বাতিল করুন
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold transition-colors"
          >
            ড্রাফট রাখুন
          </button>

          <button
            type="button"
            onClick={() => handleSave(canPublishDirectly ? 'published' : 'draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : (canPublishDirectly ? 'প্রকাশ করুন' : 'পর্যালোচনায় জমা দিন')}</span>
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Grid: Main Left Content vs Right Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Subtitle Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সংবাদের মূল শিরোনাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="যেমন: বিশ্বম্ভরপুরে সুরমা নদীর বাঁধ নির্মাণ প্রকল্পে বড় অগ্রগতি..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-base text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                উপ-শিরোনাম (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="সংবাদের সংক্ষেপ সারমর্ম বা চমকপ্রদ উপ-শিরোনাম..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Content & Formatting Editor Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Editor Toolbar & Mode Switch */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyFormatting('<b>', '</b>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  title="বোল্ড (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<i>', '</i>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs italic"
                  title="ইটালিক (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<u>', '</u>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs underline"
                  title="আন্ডারলাইন (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => applyFormatting('<h2>', '</h2>')}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  title="শিরোনাম ২ (Heading 2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<h3>', '</h3>')}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  title="শিরোনাম ৩ (Heading 3)"
                >
                  H3
                </button>
                <span className="w-px h-4 bg-slate-300 mx-1" />
                <button
                  type="button"
                  onClick={() => applyFormatting('<blockquote>\n', '\n</blockquote>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                  title="উদ্ধৃতি (Blockquote)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                  className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs"
                  title="বুলেট পয়েন্ট"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<p>', '</p>')}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 text-slate-700 text-xs font-mono"
                  title="প্যারাগ্রাফ"
                >
                  &lt;p&gt;
                </button>
              </div>

              {/* Write vs Preview Toggle */}
              <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  লেখা (Editor)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  প্রিভিউ (Preview)
                </button>
              </div>
            </div>

            {/* Editor Area */}
            {activeTab === 'write' ? (
              <textarea
                ref={contentTextareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="এখানে সংবাদের বিস্তারিত বিবরণ লিখুন... (HTML বা সাধারণ টেক্সট সমর্থন করে)"
                rows={16}
                className="w-full p-4 text-slate-800 text-sm leading-relaxed focus:outline-none resize-y font-sans font-normal"
              />
            ) : (
              <div className="p-6 bg-white min-h-[380px] prose prose-slate max-w-none">
                <h1 className="text-xl font-bold text-slate-900 mb-2">{title || 'সংবাদের শিরোনাম প্রিভিউ'}</h1>
                {subtitle && <h3 className="text-sm font-semibold text-slate-600 mb-4">{subtitle}</h3>}
                <div
                  className="text-slate-800 text-sm leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: content || '<p className="text-slate-400">বিস্তারিত বিবরণ খালি রয়েছে।</p>' }}
                />
              </div>
            )}

            {/* Word count footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>মোট শব্দ: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
              <span>অক্ষর সংখ্যা: {content.length}</span>
            </div>
          </div>

          {/* Excerpt / Summary Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              সংবাদের চুম্বক অংশ / সংক্ষিপ্ত বিবরণ (Excerpt)
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="হোমপেজে এবং সোশ্যাল মিডিয়া শেয়ারিংয়ে প্রদর্শিত সংক্ষিপ্ত বিবরণ..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs text-slate-800"
            />
          </div>

          {/* SEO Search Engine Snippet Preview Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">সার্চ ইঞ্জিন অপটিমাইজেশন (Google SEO Snippet)</h3>
            </div>

            {/* Google Search Snippet Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-sans">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="text-blue-700 font-medium">https://haortvhd.com</span>
                <span>›</span>
                <span className="text-slate-600">{category}</span>
              </div>
              <h4 className="text-base text-blue-800 font-semibold hover:underline cursor-pointer truncate">
                {seoTitle || title || 'সংবাদের শিরোনাম'}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {seoDescription || summary || 'সংবাদের সংক্ষিপ্ত বর্ণনা গুগলে সার্চ করলে পাঠকরা এভাবে দেখতে পাবেন।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ফোকাস কীওয়ার্ড (Focus Keyword)</label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={e => setFocusKeyword(e.target.value)}
                  placeholder="যেমন: সুরমা নদী, বিশ্বম্ভরপুর"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">মেটা কিওয়ার্ড / ট্যাগস</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="কমা দিয়ে লিখুন: সুনামগঞ্জ, হাওর, উন্নয়ন"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Controls Column (1 Col) */}
        <div className="space-y-5">
          {/* Publishing & Status Settings */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              প্রকাশনা ও স্ট্যাটাস
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">সংবাদের স্ট্যাটাস</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 bg-white"
              >
                {canPublishDirectly && <option value="published">সরাসরি প্রকাশিত (Published)</option>}
                <option value="draft">ড্রাফট (Draft)</option>
                <option value="scheduled">নির্ধারিত সময়ে (Scheduled)</option>
              </select>
            </div>

            {/* Switches */}
            <div className="space-y-2.5 pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={e => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-slate-300"
                />
                <span className="flex items-center gap-1 font-semibold text-red-600">
                  <Flame className="w-3.5 h-3.5" /> ব্রেকিং নিউজ হিসেবে দেখান
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500 border-slate-300"
                />
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> শীর্ষ লিড নিউজ (Lead News)
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHomepageFeatured}
                  onChange={e => setIsHomepageFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <span>হোমপেজের বিশেষ ব্লকে প্রদর্শন</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={e => setAllowComments(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <span>পাঠক মন্তব্য গ্রহণ করুন</span>
              </label>
            </div>
          </div>

          {/* Category & Location Box */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              ক্যাটাগরি ও অবস্থান
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রধান বিভাগ (Category) <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                উপ-বিভাগ (Subcategory)
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="যেমন: নদী শাসন, আদালত"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>সংবাদের স্থান (Location)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="যেমন: বিশ্বম্ভরপুর, সুনামগঞ্জ"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Featured Image & Thumbnail Box */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">প্রধান ছবি (Featured Image)</h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                লাইব্রেরি থেকে নিন
              </button>
            </div>

            {/* Image Preview Box */}
            <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group">
              <img
                src={featuredImage}
                alt={imageAlt || 'সংবাদের ছবি'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold shadow"
                >
                  ছবি পরিবর্তন
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-red-500 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingImage ? 'কমপ্রেস ও আপলোড হচ্ছে...' : 'কম্পিউটার থেকে ছবি আপলোড'}</span>
            </button>

            {/* Direct URL input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">ছবির ওয়েব লিঙ্ক (Image URL)</label>
              <input
                type="text"
                value={featuredImage}
                onChange={e => setFeaturedImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Caption & Alt */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ছবির ক্যাপশন (Caption)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={e => setImageCaption(e.target.value)}
                  placeholder="ছবির নিচে প্রদর্শিত ক্যাপশন..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ছবির অল্ট টেক্সট (Alt Text)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={e => setImageAlt(e.target.value)}
                  placeholder="ছবির সংক্ষিপ্ত পরিচয়..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">মিডিয়া লাইব্রেরি থেকে ছবি নির্বাচন করুন</h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 custom-scrollbar">
              {mediaList.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  কোনো ছবি পাওয়া যায়নি। সরাসরি আপলোড করুন।
                </div>
              ) : (
                mediaList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFeaturedImage(item.url);
                      if (item.caption) setImageCaption(item.caption);
                      if (item.altText) setImageAlt(item.altText);
                      setShowMediaModal(false);
                    }}
                    className={`aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative group ${
                      featuredImage === item.url ? 'border-red-600 shadow-md ring-2 ring-red-500/30' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={item.url} alt={item.altText || ''} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      নির্বাচন করুন
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
