import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageSquare, 
  Printer, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Eye, 
  Send, 
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { NewsArticle, Comment, AdItem, User as AuthUser } from '../types';
import { toBengaliNumber, timeAgoBengali, getBengaliDate } from '../lib/utils';
import { AdsterraSlot } from './AdsterraSlot';
import { api } from '../lib/api';

interface NewsDetailsProps {
  article: NewsArticle;
  relatedNews: NewsArticle[];
  popularNews: NewsArticle[];
  newsDetailsAd?: AdItem;
  sidebarAd?: AdItem;
  currentUser: AuthUser | null;
  onBack: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (cat: string) => void;
}

export const NewsDetailsModalOrPage: React.FC<NewsDetailsProps> = ({
  article,
  relatedNews,
  popularNews,
  newsDetailsAd,
  sidebarAd,
  currentUser,
  onBack,
  onSelectArticle,
  onSelectCategory
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');

  // Scroll to top on article change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadComments();
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [article.id]);

  const loadComments = async () => {
    try {
      const res = await api.getComments(article.id);
      setComments(res.comments || []);
    } catch {
      // ignore
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title} - হাওর টিভি HD\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${article.title} | হাওর টিভি HD`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে ভয়েস রিডার সমর্থিত নয়।');
      return;
    }

    if (isPlayingAudio) {
      speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${article.title}। ${article.summary}। ${article.content.replace(/<[^>]*>?/gm, '')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.9;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.postComment({
        newsId: article.id,
        userName: commentName.trim(),
        userEmail: commentEmail.trim(),
        commentText: commentText.trim()
      });

      setComments(prev => [res.comment, ...prev]);
      setCommentText('');
      setCommentSuccessMsg('আপনার মন্তব্য সফলভাবে জমা হয়েছে।');
      setTimeout(() => setCommentSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'মন্তব্য পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Structured Data Schema for NewsArticle (SEO)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.featuredImage],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: [
      {
        '@type': 'Person',
        name: article.authorName,
        jobTitle: article.authorRole
      }
    ],
    publisher: {
      '@type': 'Organization',
      name: 'হাওর টিভি HD',
      logo: {
        '@type': 'ImageObject',
        url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300'
      }
    },
    description: article.summary
  };

  return (
    <div className="bg-gray-50 py-6 min-h-screen">
      {/* Inject NewsArticle Schema Markup dynamically */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>প্রচ্ছদ</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <button
              onClick={() => onSelectCategory(article.category)}
              className="text-gray-600 hover:text-red-700 font-medium"
            >
              {article.category}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
          </div>

          <button
            onClick={onBack}
            className="text-xs bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded shadow-xs"
          >
            ফিরে যান
          </button>
        </div>

        {/* Article Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article (8 Cols) */}
          <article className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-4 sm:p-7 shadow-xs">
            {/* Category & Location */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span
                onClick={() => onSelectCategory(article.category)}
                className="cursor-pointer bg-red-700 text-white text-xs font-bold px-3 py-1 rounded"
              >
                {article.category}
              </span>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  {article.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {toBengaliNumber(article.views || 1)} ভিউ
                </span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 font-serif">
              {article.title}
            </h1>

            {article.subtitle && (
              <h2 className="text-base sm:text-lg font-medium text-red-800 mb-4 pb-2 border-b border-gray-100">
                {article.subtitle}
              </h2>
            )}

            {/* Author Byline & Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 my-4 border-y border-gray-100 bg-gray-50/60 px-3 rounded-lg text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs">
                  {article.authorName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{article.authorName}</div>
                  <div className="text-gray-500 text-[11px]">{article.authorRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>প্রকাশ: {article.publishDate}, {article.publishTime}</span>
                </div>
                {article.updatedAt && (
                  <span className="hidden sm:inline text-gray-400">
                    ({timeAgoBengali(article.updatedAt)})
                  </span>
                )}
              </div>
            </div>

            {/* Action Bar (Font size, Text to speech, Print, Social share) */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-1 mb-5 border-b border-gray-100">
              {/* Font Sizing & Voice */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden text-xs">
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-1 ${fontSize === 'normal' ? 'bg-red-700 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-1 ${fontSize === 'large' ? 'bg-red-700 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-2 py-1 ${fontSize === 'xlarge' ? 'bg-red-700 text-white font-bold' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={handleToggleVoice}
                  title="সংবাদটি শুনে নিন"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition border ${
                    isPlayingAudio
                      ? 'bg-red-700 text-white border-red-700 animate-pulse'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                  <span>{isPlayingAudio ? 'থামুন' : 'শুনুন'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  title="প্রিন্ট করুন"
                  className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded text-xs bg-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-500 mr-1 hidden sm:inline">শেয়ার:</span>
                <button
                  onClick={handleShareFacebook}
                  title="Facebook এ শেয়ার করুন"
                  className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  title="WhatsApp এ শেয়ার করুন"
                  className="p-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShareTwitter}
                  title="Twitter/X এ শেয়ার করুন"
                  className="p-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyLink}
                  title="লিংক কপি করুন"
                  className="flex items-center gap-1 text-xs border border-gray-200 px-2 py-1 rounded bg-white hover:bg-gray-50 text-gray-700"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
            </div>

            {/* Featured Image & Caption */}
            <div className="mb-6">
              <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-gray-100 shadow-xs">
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.imageCaption && (
                <p className="text-xs text-gray-500 italic mt-2 px-1 text-center">
                  ছবি: {article.imageCaption}
                </p>
              )}
            </div>

            {/* Article Content Body */}
            <div
              className={`text-gray-800 leading-relaxed font-sans space-y-4 ${
                fontSize === 'large'
                  ? 'text-lg leading-loose'
                  : fontSize === 'xlarge'
                  ? 'text-xl leading-loose'
                  : 'text-base leading-relaxed'
              }`}
            >
              {article.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-justify">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* In-Article Advertisement Slot */}
            {newsDetailsAd && (
              <div className="my-6">
                <AdsterraSlot ad={newsDetailsAd} slotLabel="আর্টিকেল ব্যানার বিজ্ঞাপন (৭২৮x৯০)" />
              </div>
            )}

            {/* Tags Pill List */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 mt-6 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
                  সম্পর্কিত বিষয় বা ট্যাগ:
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-700 text-xs px-3 py-1 rounded-full cursor-pointer transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <section className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-700" />
                  <span>মন্তব্য ({toBengaliNumber(comments.length)})</span>
                </h3>
              </div>

              {/* Submit Comment Form */}
              <form onSubmit={handleSubmitComment} className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  আপনার মতামত প্রকাশ করুন
                </h4>

                {commentSuccessMsg && (
                  <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded">
                    {commentSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    required
                    placeholder="আপনার পুরো নাম *"
                    value={commentName}
                    onChange={e => setCommentName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="email"
                    placeholder="ইমেইল ঠিকানা (গোপন রাখা হবে)"
                    value={commentEmail}
                    onChange={e => setCommentEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="আপনার মন্তব্য লিখুন... *"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-600 mb-3"
                ></textarea>

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'পাঠানো হচ্ছে...' : 'মন্তব্য পোস্ট করুন'}</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    এই সংবাদের এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!
                  </p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-3 bg-white border border-gray-100 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{c.userName}</span>
                        <span className="text-gray-400">{timeAgoBengali(c.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{c.commentText}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Details Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Sidebar Ad Slot */}
            {sidebarAd && <AdsterraSlot ad={sidebarAd} slotLabel="সাইডবার বিজ্ঞাপন (৩০০x২৫০)" />}

            {/* Related News (সম্পর্কিত সংবাদ) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 pb-2 mb-3 border-b-2 border-red-700 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-700 rounded-full"></span>
                <span>সম্পর্কিত সংবাদ ({article.category})</span>
              </h3>

              <div className="divide-y divide-gray-100">
                {relatedNews.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">অন্য কোনো সম্পর্কিত সংবাদ পাওয়া যায়নি।</p>
                ) : (
                  relatedNews.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onSelectArticle(item)}
                      className="group cursor-pointer py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-red-50/40 p-1 rounded transition"
                    >
                      <div className="w-20 aspect-16/10 rounded overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={item.thumbnailImage || item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {timeAgoBengali(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Most Read (সর্বাধিক পঠিত) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 pb-2 mb-3 border-b-2 border-red-700 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-700 rounded-full"></span>
                <span>সর্বাধিক পঠিত</span>
              </h3>

              <div className="divide-y divide-gray-100">
                {popularNews.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectArticle(item)}
                    className="group cursor-pointer py-2.5 flex items-start gap-2.5 hover:bg-gray-50 p-1 rounded transition"
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {toBengaliNumber(idx + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 group-hover:text-red-700 transition line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {toBengaliNumber(item.views)} বার পঠিত
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
