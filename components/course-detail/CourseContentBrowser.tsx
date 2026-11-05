'use client';

import { useState, useMemo } from 'react';
import { CourseContentItem, ContentType } from '@/types/course';
import { matchesSearch } from '@/lib/normalizeArabic';
import { isSafeExternalUrl } from '@/lib/safeUrl';
import { 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Link2, 
  Search, 
  ExternalLink, 
  Download, 
  Clock, 
  FolderSearch,
  Calendar,
  Eye
} from 'lucide-react';

interface CourseContentBrowserProps {
  items: CourseContentItem[];
  courseCode: string;
}

type TabType = 'all' | ContentType;

export function CourseContentBrowser({ items, courseCode }: CourseContentBrowserProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count items per tab
  const counts = useMemo(() => {
    return {
      all: items.length,
      file: items.filter((i) => i.type === 'file').length,
      video: items.filter((i) => i.type === 'video').length,
      image: items.filter((i) => i.type === 'image').length,
      link: items.filter((i) => i.type === 'link').length,
    };
  }, [items]);

  // Filter items based on active tab and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab !== 'all' && item.type !== activeTab) {
        return false;
      }

      // Search query filter with Arabic normalization
      if (searchQuery.trim()) {
        const matchTitle = matchesSearch(item.title, searchQuery);
        const matchDesc = matchesSearch(item.description, searchQuery);
        const matchFormat = matchesSearch(item.format, searchQuery);
        if (!matchTitle && !matchDesc && !matchFormat) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Helper for item type icon & badge
  const getItemIcon = (type: ContentType) => {
    switch (type) {
      case 'file':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      case 'video':
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
        );
      case 'image':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
        );
      case 'link':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
        );
    }
  };

  const getFormatBadge = (type: ContentType, format: string) => {
    switch (type) {
      case 'file':
        return <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap">{format}</span>;
      case 'video':
        return <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 whitespace-nowrap">{format}</span>;
      case 'image':
        return <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">{format}</span>;
      case 'link':
        return <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">رابط</span>;
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Search & Tabs Controller */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/90 shadow-xs space-y-2.5 sm:space-y-3">
        {/* In-Course Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث داخل محتويات ${courseCode} (محاضرة، PDF، فيديو)...`}
            className="w-full pr-10 sm:pr-11 pl-12 sm:pl-14 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Tabs: Swipeable on Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <span>جميع المحتويات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'file'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>المحاضرات والملفات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'file' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.file}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'video'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الفيديوهات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'video' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.video}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>المخططات والصور</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'image' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.image}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'link'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>الروابط</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'link' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.link}
            </span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Organized Individual Cards */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3 sm:space-y-3.5">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Right Side: Icon + Title + Description */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="shrink-0 mt-0.5">
                  {getItemIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base leading-snug">
                      {item.title}
                    </h4>
                    {/* Format badge inline on title row on mobile */}
                    <div className="md:hidden">
                      {getFormatBadge(item.type, item.format)}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Mobile Meta Details Bar */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-500 md:hidden pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                      {item.duration ? (
                        <span className="flex items-center gap-1 text-indigo-700 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      ) : (
                        <span>{item.size || 'رابط خارجي'}</span>
                      )}
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{item.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Side (Tablet & Desktop): Organized Meta Badges in Clean Capsules */}
              <div className="hidden md:flex items-center gap-3.5 shrink-0 px-4 border-x border-slate-100">
                {/* Format Badge */}
                <div>
                  {getFormatBadge(item.type, item.format)}
                </div>

                {/* Size or Duration Badge */}
                <div className="text-xs font-semibold min-w-[75px] text-center">
                  {item.duration ? (
                    <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      <span>{item.size || '—'}</span>
                    </span>
                  )}
                </div>

                {/* Upload Date Badge */}
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 min-w-[95px] justify-center bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.uploadedAt}</span>
                </div>
              </div>

              {/* Left Side: Direct Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* View / Open Button */}
                {isSafeExternalUrl(item.url) ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="عرض في علامة تبويب جديدة"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2]" />
                    <span>عرض</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 text-blue-400 bg-blue-50/30 text-xs font-bold shadow-2xs opacity-50 cursor-not-allowed"
                    title="الرابط غير متاح"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2]" />
                    <span>عرض</span>
                  </button>
                )}

                {/* Download Button (for files, videos, images) */}
                {item.type !== 'link' && (
                  isSafeExternalUrl(item.downloadUrl || item.url) ? (
                    <a
                      href={item.downloadUrl || item.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="تنزيل الملف مباشرة"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs opacity-50 cursor-not-allowed"
                      title="رابط التنزيل غير متاح"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Footer Card Summary */}
          <div className="bg-slate-50/80 rounded-2xl px-5 py-3 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
            <span className="font-semibold text-slate-700">إجمالي المعروض: {filteredItems.length} عنصر</span>
            <span className="text-[11px] text-slate-400">الملفات مخزنة وموثقة سحابياً بواسطة كلية الذكاء الاصطناعي</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FolderSearch className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">لا توجد عناصر مطابقة للبحث</h4>
          <p className="text-xs text-slate-500 mb-4">
            تأكد من كتابة الكلمات بشكل صحيح أو قم بالتبديل إلى تبويب آخر.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            عرض كافة المحتويات
          </button>
        </div>
      )}
    </div>
  );
}
