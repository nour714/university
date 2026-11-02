'use client';

import { useState, useMemo } from 'react';
import { CourseContentItem, ContentType } from '@/types/course';
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
  CheckCircle2,
  HardDrive
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

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        const matchFormat = item.format.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchFormat) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Helper for item type icon & badge
  const getItemIcon = (type: ContentType, format: string) => {
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
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">{format}</span>;
      case 'video':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">{format}</span>;
      case 'image':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">{format}</span>;
      case 'link':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">رابط خارجي</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Tabs Controller */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* In-Course Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`ابحث داخل محتويات ${courseCode} (اسم محاضرة، PDF، فيديو، أو موضوع)...`}
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
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

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'file'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المحاضرات والملفات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'file' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.file}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>الفيديوهات والشروحات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'video' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.video}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>المخططات والصور</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'image' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.image}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'link'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>الروابط والمستودعات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'link' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.link}
            </span>
          </button>
        </div>
      </div>

      {/* Google Drive Style Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">اسم العنصر والمحتوى</th>
                  <th scope="col" className="py-3.5 px-4 hidden sm:table-cell">النوع</th>
                  <th scope="col" className="py-3.5 px-4 hidden md:table-cell">الحجم / المدة</th>
                  <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">تاريخ الرفع</th>
                  <th scope="col" className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Item Title & Icon */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        {getItemIcon(item.type, item.format)}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          {/* Mobile-only info row */}
                          <div className="flex items-center gap-2 mt-1.5 sm:hidden text-[10px] text-slate-400">
                            {getFormatBadge(item.type, item.format)}
                            <span>{item.size || item.duration || 'رابط'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Format Badge */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      {getFormatBadge(item.type, item.format)}
                    </td>

                    {/* Size or Duration */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-600 font-medium">
                      {item.duration ? (
                        <span className="flex items-center gap-1 text-indigo-700">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      ) : (
                        <span>{item.size || '—'}</span>
                      )}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-slate-500">
                      {item.uploadedAt}
                    </td>

                    {/* Actions: View in New Tab & Download */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View in New Tab Button */}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 hover:border-blue-600 text-xs font-semibold transition-all shadow-2xs"
                          title="عرض في علامة تبويب جديدة"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </a>

                        {/* Download Button (for files, videos, images) */}
                        {item.type !== 'link' && (
                          <a
                            href={item.downloadUrl || item.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-800 text-xs font-semibold transition-all shadow-2xs"
                            title="تنزيل الملف مباشرة"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">تنزيل</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>إجمالي المعروض: {filteredItems.length} عنصر</span>
            <span className="text-[11px] text-slate-400">الملفات مخزنة وموثقة سحابياً بواسطة كلية الذكاء الاصطناعي</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FolderSearch className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">لا توجد عناصر مطابقة للبحث</h4>
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

