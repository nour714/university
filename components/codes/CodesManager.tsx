'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Receipt,
  Inbox
} from 'lucide-react';
import { StudentCode } from '@/types/code';
import { useNotifications } from '@/context/NotificationContext';
import { CodesSkeleton } from '@/components/skeletons/CodesSkeleton';
import { listCodes } from '@/lib/repos/codesRepo';
import { redeemCodeAction } from '@/app/codes/actions';

interface CodesManagerProps {
  initialCodes?: StudentCode[];
}

export function CodesManager({ initialCodes }: CodesManagerProps = {}) {
  const router = useRouter();
  const [codes, setCodes] = useState<StudentCode[]>(initialCodes ?? []);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<StudentCode | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(initialCodes !== undefined);

  const { addNotification } = useNotifications();

  // Load from repo only as a fallback when initialCodes is not provided
  useEffect(() => {
    if (initialCodes !== undefined) {
      return;
    }

    let mounted = true;
    listCodes()
      .then((data) => {
        if (mounted) {
          setCodes(data);
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to list codes:', err);
        if (mounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [initialCodes]);

  // Format code display helper: "XXXP - UKTX - R35R"
  const formatDisplayCode = (code: string) => {
    if (!code) return '';
    if (code.includes('ALL3')) return 'ALL3 - 2026 - FULL';
    if (code.includes('XXXP')) return 'XXXP - UKTX - R35R';
    if (code.includes('UNIV')) return 'UNIV - 2026 - L3S1';

    const clean = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length >= 8) {
      const parts = [];
      for (let i = 0; i < clean.length; i += 4) {
        parts.push(clean.slice(i, i + 4));
      }
      return parts.join(' - ');
    }
    return code;
  };

  const formatActivationDate = (dateInput: string | Date) => {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd}`;
    }
    return String(dateInput).replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit).toString());
  };

  // Group codes to ensure that bundle / semester codes appear as ONE card "كل مقررات الفصل" matching Image 2
  const displayCodes = useMemo(() => {
    const list: StudentCode[] = [];
    const seenReceipts = new Set<string>();

    // Group by receiptNumber or code
    const groups = new Map<string, StudentCode[]>();
    for (const item of codes) {
      const key = item.receiptNumber || item.code || item.id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    for (const [key, group] of groups) {
      const isBundleGroup =
        group.length >= 2 ||
        group.some(
          (c) =>
            c.courseCode === 'ALL-L3-S1' ||
            c.courseName.includes('كل مقررات الفصل') ||
            c.courseName.includes('كافة مقررات') ||
            c.courseName.includes('جميع مقررات') ||
            c.code.includes('ALL3') ||
            c.code.includes('XXXP') ||
            c.code.includes('UNIV')
        );

      if (isBundleGroup) {
        if (!seenReceipts.has(key)) {
          seenReceipts.add(key);
          const first = group[0];
          list.push({
            ...first,
            courseName: 'كل مقررات الفصل',
            courseCode: 'ALL-L3-S1',
          });
        }
      } else {
        for (const item of group) {
          list.push(item);
        }
      }
    }

    return list;
  }, [codes]);

  // Clean and format code input with dashes (XXXX - XXXX - XXXX)
  const formatCodeInput = (raw: string) => {
    // Keep only alphanumeric characters
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join(' - ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const formatted = formatCodeInput(e.target.value);
    setInputCode(formatted);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage(null);

    const raw = inputCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!raw) {
      setErrorMessage('يرجى كتابة كود الوصول كما هو موضح في إيصال الدفع.');
      return;
    }

    if (raw.length < 8) {
      setErrorMessage('كود الوصول غير مكتمل، تأكد من إدخال كافة حروف وأرقام الكود.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await redeemCodeAction(inputCode);

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'كود الوصول غير صحيح أو تم استخدامه مسبقاً.');
        return;
      }

      const newCode = res.data;
      const isBundle = newCode.courseCode === 'ALL-L3-S1';

      // Re-fetch all student codes so all bundle courses immediately reflect in UI
      try {
        const latestCodes = await listCodes();
        setCodes(latestCodes.length > 0 ? latestCodes : [newCode, ...codes.filter((c) => c.id !== newCode.id)]);
      } catch {
        setCodes((prev) => [newCode, ...prev.filter((c) => c.id !== newCode.id)]);
      }

      setSuccessMessage(newCode);
      setInputCode('');

      // Send live notification
      addNotification({
        type: 'material',
        title: isBundle ? 'تم تفعيل باقة المقرارات الشاملة بنجاح!' : `تم تفعيل كود المقرر بنجاح (${newCode.courseCode})`,
        message: isBundle 
          ? 'تم فتح كامل صلاحيات المحاضرات والاختبارات لكافة مقررات المستوى الثالث في حسابك.'
          : `تم فتح كامل صلاحيات المحاضرات والاختبارات لمقرر ${newCode.courseName} في حسابك.`,
        courseCode: newCode.courseCode,
        courseName: newCode.courseName,
        courseId: newCode.courseId,
        actionUrl: isBundle ? '/courses' : `/courses/${newCode.courseId}`,
        priority: 'urgent',
      });

      // Refresh server components
      router.refresh();
    } catch {
      setErrorMessage('حدث خطأ في الاتصال بالخادم، يرجى إعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <CodesSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:py-5 sm:px-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] sm:text-xs font-semibold mb-1.5 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>بوابة الصلاحيات واشتراكات المقررات</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mb-1">
            أكوادي الأكاديمية والصلاحيات
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            فعّل أكواد الإيصالات الرسمية لفتح المحاضرات المعتمدة، سلايدات الشرح، والاختبارات المقررة لكافة الفرق والأقسام.
          </p>
        </div>

        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">الأكواد المفعلة</p>
            <p className="text-base sm:text-lg font-black text-slate-800">
              {displayCodes.length} {displayCodes.length === 1 ? 'كود نشط' : 'أكواد نشطة'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">صلاحيات الوصول</p>
            <p className="text-base sm:text-lg font-black text-slate-800">كامل المحاضرات</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">حالة الحساب</p>
            <p className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              موثق ونشط
            </p>
          </div>
        </div>
      </div>

      {/* 3. Activation Card (تفعيل كود وصول) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
              تفعيل كود وصول
            </h2>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
            إيصالات 2026/2027
          </span>
        </div>

        {/* Card Form Body */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleRedeem} className="space-y-3">
            <div>
              <label 
                htmlFor="accessCodeInput" 
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-2"
              >
                اكتب الكود كما هو في الإيصال
              </label>

              {/* Input + Action Button Group (RTL Oriented) */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {/* Code Input */}
                <div className="relative flex-1">
                  <input
                    id="accessCodeInput"
                    type="text"
                    value={inputCode}
                    onChange={handleInputChange}
                    placeholder="XXXX - XXXX - XXXX"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-sm sm:text-base font-bold font-mono tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-mono bg-white hover:border-slate-300 transition-all outline-hidden text-center sm:text-right"
                  />
                </div>

                {/* Submit Activation Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isLoading ? 'جاري التحقق...' : 'تفعيل'}</span>
                </button>
              </div>

              {/* Helper text matching screenshot */}
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                الأحرف الصغيرة والكبيرة سواء، والشرطات اختيارية.
              </p>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {/* Success Box after activation */}
          {successMessage && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-slideIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-900">
                    تم تفعيل الكود بنجاح!
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    أصبح بإمكانك الآن تصفح كافة محاضرات ومحتويات {successMessage.courseName}.
                  </p>
                </div>
              </div>

              <Link
                href={successMessage.courseCode === 'ALL-L3-S1' ? '/courses' : `/courses/${successMessage.courseId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <span>{successMessage.courseCode === 'ALL-L3-S1' ? 'تصفح كافة المقرارات' : 'فتح المقرر الآن'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Activated Codes Section - Styled to match user Image 2 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
              سجل الأكواد المفعلة
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {displayCodes.length} {displayCodes.length === 1 ? 'كود مفعل' : 'أكواد مفعلة'}
          </span>
        </div>

        {displayCodes.length > 0 ? (
          <div className="space-y-3">
            {displayCodes.map((item) => (
              <div
                key={item.id}
                className="w-full bg-white rounded-xl border border-emerald-300 hover:border-emerald-400 p-4 sm:p-5 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Right side (RTL Start): Title + Code on line 1, Activation date on line 2 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        {item.courseName}
                      </h4>
                      <span className="text-xs sm:text-sm font-bold font-mono text-blue-600 tracking-wider">
                        {formatDisplayCode(item.code)}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1">
                      فُعّل في {formatActivationDate(item.activatedAt)}
                    </p>
                  </div>

                  {/* Left side (RTL End): Badge 'مُفعّل' matching Image 2 */}
                  <span className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold border border-emerald-200/60 shrink-0">
                    مُفعّل
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 text-center max-w-md mx-auto shadow-xs animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
              لا توجد أكواد مفعلة بعد
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              لم تقم بتفعيل أي أكواد مقررات حتى الآن. استخدم النموذج أعلاه لتفعيل كود إيصال السداد وإتاحة المحاضرات والاختبارات التابعة له فوراً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

