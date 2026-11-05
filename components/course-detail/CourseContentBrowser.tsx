'use client';

import { useState, useMemo } from 'react';
import { CourseContentItem, ContentType } from '@/types/course';
import { matchesSearch } from '@/lib/normalizeArabic';
import { isSafeExternalUrl } from '@/lib/safeUrl';
import { useNotifications } from '@/context/NotificationContext';
import { 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Link2, 
  BookOpen,
  Search, 
  ExternalLink, 
  Download, 
  Bookmark, 
  Folder,
  Eye,
  Lock,
  CheckCircle2,
  X,
  KeyRound,
  ShieldAlert,
  Sparkles,
  FolderSearch
} from 'lucide-react';

interface CourseContentBrowserProps {
  items: CourseContentItem[];
  courseCode: string;
}

type TabType = 'all' | ContentType;

export function CourseContentBrowser({ items, courseCode }: CourseContentBrowserProps) {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Unlocked items state
  const [unlockedItemIds, setUnlockedItemIds] = useState<Set<string>>(new Set());
  
  // Modal for entering / activating access code
  const [activeCodeModalItem, setActiveCodeModalItem] = useState<CourseContentItem | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');

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
        const matchDesc = matchesSearch(item.description || '', searchQuery);
        const matchFormat = matchesSearch(item.format, searchQuery);
        if (!matchTitle && !matchDesc && !matchFormat) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Intelligent chapter resolver
  const getItemChapter = (item: CourseContentItem): { name: string; isGeneral: boolean } => {
    if (item.chapter) {
      const isGeneral = item.chapter.includes('عام') || item.chapter.includes('محتوى') || item.chapter.toLowerCase().includes('general');
      return { name: item.chapter, isGeneral };
    }
    const t = item.title.toLowerCase();
    if (t.includes('01') || t.includes(' 1') || t.includes('chapter 1') || t.includes('chapter-1') || t.includes('الأولى') || t.includes('الفصل 1')) {
      return { name: 'الفصل 1', isGeneral: false };
    }
    if (t.includes('02') || t.includes(' 2') || t.includes('chapter 2') || t.includes('chapter-2') || t.includes('الثانية') || t.includes('الفصل 2')) {
      return { name: 'الفصل 2', isGeneral: false };
    }
    if (t.includes('03') || t.includes(' 3') || t.includes('chapter 3') || t.includes('chapter-3') || t.includes('الثالثة') || t.includes('الفصل 3')) {
      return { name: 'الفصل 3', isGeneral: false };
    }
    return { name: 'محتوى عام', isGeneral: true };
  };

  // Group filtered items by Chapter / Section
  const groupedSections = useMemo(() => {
    const map = new Map<string, { name: string; isGeneral: boolean; items: CourseContentItem[] }>();

    filteredItems.forEach((item) => {
      const chapter = getItemChapter(item);
      if (!map.has(chapter.name)) {
        map.set(chapter.name, {
          name: chapter.name,
          isGeneral: chapter.isGeneral,
          items: [],
        });
      }
      map.get(chapter.name)!.items.push(item);
    });

    return Array.from(map.values());
  }, [filteredItems]);

  // Helper for subtitle text formatted nicely
  const getItemSubtitle = (item: CourseContentItem): string => {
    let cat = 'ملف/محاضرة';
    if (item.categoryLabel) {
      cat = item.categoryLabel;
    } else if (item.type === 'link') {
      cat = 'رابط خارجي';
    } else if (item.type === 'video') {
      cat = 'تسجيل فيديو';
    } else if (item.title.toLowerCase().includes('bank') || item.title.includes('كتاب') || item.title.toLowerCase().includes('book')) {
      cat = 'كتاب إلكتروني';
    } else if (item.type === 'image') {
      cat = 'مخطط توضيحي';
    }

    let meta = '';
    if (item.duration) {
      meta = `${item.duration} دقيقة`;
    } else if (item.size && item.size !== '—' && item.size !== '-') {
      meta = item.size.replace('MB', 'م.ب').replace('KB', 'ك.ب').replace('GB', 'ج.ب');
    }

    if (cat && meta) return `${cat} • ${meta}`;
    return cat || meta || '';
  };

  // Helper for item icon (Clean blue outline, no background box)
  const getItemIcon = (item: CourseContentItem) => {
    const isBook = item.categoryLabel === 'كتاب إلكتروني' || item.title.toLowerCase().includes('book') || item.title.toLowerCase().includes('bank');
    if (isBook) {
      return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 stroke-[1.8]" />;
    }
    switch (item.type) {
      case 'file':
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 stroke-[1.8]" />;
      case 'link':
        return <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 stroke-[1.8]" />;
      case 'video':
        return <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 stroke-[1.8]" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 stroke-[1.8]" />;
    }
  };

  // Click handler for Action button
  const handleActionClick = (item: CourseContentItem) => {
    const isLocked = item.requiresCode !== false && !unlockedItemIds.has(item.id);
    if (isLocked) {
      setActiveCodeModalItem(item);
      setInputCode('');
      setCodeError('');
    } else {
      if (isSafeExternalUrl(item.url)) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Unlock verification
  const handleUnlock = (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode).trim().toUpperCase();
    if (!code) {
      setCodeError('يرجى إدخال كود التفعيل الأكاديمي');
      return;
    }

    if (activeCodeModalItem) {
      setUnlockedItemIds((prev) => new Set(prev).add(activeCodeModalItem.id));
      addNotification({
        title: 'تم تفعيل المحتوى بنجاح! 🔓',
        message: `تم فتح صلاحية الوصول إلى "${activeCodeModalItem.title}".`,
        type: 'announcement',
        priority: 'normal',
      });
      const targetUrl = activeCodeModalItem.url;
      setActiveCodeModalItem(null);
      if (isSafeExternalUrl(targetUrl)) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="space-y-4">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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

      {/* Content Rendering: Grouped by Chapter / Section */}
      {groupedSections.length > 0 ? (
        <div className="space-y-6">
          {groupedSections.map((section, sectionIdx) => (
            <div 
              key={section.name} 
              className={sectionIdx > 0 ? 'pt-5 border-t border-slate-200/80' : ''}
            >
              {/* Section Header (Aligned to the Right with blue outline icon) */}
              <div className="flex items-center justify-end gap-2 mb-3">
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                  {section.name}
                </span>
                {section.isGeneral ? (
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 stroke-[2]" />
                ) : (
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 stroke-[2]" />
                )}
              </div>

              {/* Cards List for this Section */}
              <div className="space-y-2.5">
                {section.items.map((item) => {
                  const isUnlocked = !item.requiresCode || unlockedItemIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                    >
                      {/* Right Side: Icon + Title + Badge + Subtitle */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Blue Outline Icon */}
                        <div className="shrink-0 flex items-center justify-center">
                          {getItemIcon(item)}
                        </div>

                        {/* Title and Metadata Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-xs sm:text-sm md:text-base leading-snug">
                              {item.title}
                            </h4>

                            {/* Code Required Badge */}
                            {item.requiresCode !== false && (
                              isUnlocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>مفعل بالكود</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef9c3] text-[#854d0e] border border-[#fde047]/70 shrink-0 shadow-2xs">
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  <span>يتطلب كود</span>
                                </span>
                              )
                            )}
                          </div>

                          {/* Subtitle */}
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            {getItemSubtitle(item)}
                          </p>
                        </div>
                      </div>

                      {/* Left Side: Blue Outline Action Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {item.type === 'link' ? (
                          <button
                            type="button"
                            onClick={() => handleActionClick(item)}
                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 active:scale-95 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="فتح الرابط"
                          >
                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                            <span>فتح</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActionClick(item)}
                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 active:scale-95 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="عرض المحتوى"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                            <span>عرض</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Table Footer Summary */}
          <div className="bg-slate-50/80 rounded-2xl px-5 py-3 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
            <span className="font-semibold text-slate-700">إجمالي المعروض: {filteredItems.length} عنصر في {groupedSections.length} أقسام</span>
            <span className="text-[11px] text-slate-400">الملفات مخزنة وموثقة سحابياً بواسطة كلية الذكاء الاصطناعي</span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-slate-200/80 shadow-xs max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FolderSearch className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-base mb-1">لا توجد محتويات مطابقة</h4>
          <p className="text-xs text-slate-500">
            لم نتمكن من العثور على أي ملفات أو محاضرات تطابق كلمة البحث "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
          >
            إعادة تعيين البحث
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACCESS CODE ACTIVATION MODAL (يتطلب كود تفعيل المقرر)       */}
      {/* ========================================================= */}
      {activeCodeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveCodeModalItem(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center mb-3.5">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              تفعيل المحتوى الأكاديمي
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              هذا المحتوى محمي ويتطلب كود تفعيل المقرر الأكاديمي للوصول إليه. أدخل كود المقرر أو استخدم كود الطالب للتفعيل الفوري.
            </p>

            {/* Target Item Pill */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 flex items-center gap-3">
              <div className="shrink-0">{getItemIcon(activeCodeModalItem)}</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-slate-800 truncate">
                  {activeCodeModalItem.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {getItemSubtitle(activeCodeModalItem)}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كود التفعيل الأكاديمي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setCodeError('');
                  }}
                  placeholder="مثال: AI26 - 8841 - K92X"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 font-mono tracking-wider transition-all outline-hidden font-bold"
                  autoFocus
                />
                {codeError && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{codeError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>تأكيد كود التفعيل وفتح المحتوى</span>
                </button>

                {/* Instant Student Demo Activation */}
                <button
                  type="button"
                  onClick={() => handleUnlock('AI26 - 8841 - K92X')}
                  className="w-full h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>تفعيل فوري بكود الطالب (عبد الرحمن خالد)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
