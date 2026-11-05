'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  FileText
} from 'lucide-react';

interface Slide {
  id: number;
  stepBadge: string;
  badgeIcon: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  gradientTheme: string;
  glowColor: string;
  // Interactive mini preview mockup inside the slide
  mockup: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    stepBadge: 'الخطوة الأولى: تسجيل الدخول السلس',
    badgeIcon: <GraduationCap className="w-3.5 h-3.5 text-blue-300" />,
    title: 'ادخل بوابتك الأكاديمية بنقرة واحدة',
    description: 'أدخل رقمك الأكاديمي أو القومي للوصول الفوري إلى لوحة تحكمك الشخصية ومتابعة خطتك الدراسية.',
    imageSrc: '/onboarding/slide-1.jpg',
    gradientTheme: 'from-[#0b132b] via-[#1c2541] to-[#1e3a8a]',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    mockup: (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/15 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              أ.خ
            </div>
            <div>
              <p className="text-xs font-bold text-white">عبد الرحمن خالد</p>
              <p className="text-[10px] text-blue-200">المستوى 3 • ذكاء اصطناعي</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            جلسة مؤمنة
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full w-3/4 animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    stepBadge: 'الخطوة الثانية: تفعيل كود المقرر',
    badgeIcon: <KeyRound className="w-3.5 h-3.5 text-amber-300" />,
    title: 'أضف كود المادة وفك قفل المحاضرات',
    description: 'توجه إلى قسم "أكوادي" وأدخل كود تفعيل المادة المسلم لك من الكلية، وسيتم تفعيل المحاضرات والسلايدات تلقائياً.',
    imageSrc: '/onboarding/slide-2.jpg',
    gradientTheme: 'from-[#0d1b2a] via-[#1b263b] to-[#1d3557]',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    mockup: (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-amber-400/20 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-200 font-bold flex items-center gap-1.5 text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            كود تفعيل المقرر
          </span>
          <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
            تم التفعيل ✓
          </span>
        </div>
        <div className="bg-black/30 rounded-xl px-2.5 py-1.5 border border-white/10 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-amber-300 tracking-wider">
            AI-301-EXAM-2026
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    stepBadge: 'الخطوة الثالثة: تصفح الشروحات والاختبارات',
    badgeIcon: <BookOpen className="w-3.5 h-3.5 text-emerald-300" />,
    title: 'حمّل السلايدات وتابع نتائجك فوراً',
    description: 'شاهد تسجيلات المحاضرات الأكاديمية بجودة عالية، وتدرب على نماذج الاختبارات مع تصحيح ذكي ومتابعة لمعدلك التراكمي.',
    imageSrc: '/onboarding/slide-3.jpg',
    gradientTheme: 'from-[#0f172a] via-[#1e1b4b] to-[#172554]',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    mockup: (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/15 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">المحاضرة 04: الشبكات العصبية</p>
              <p className="text-[10px] text-emerald-200">سلايدات PDF متوفرة للتحميل</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-amber-300">96%</span>
        </div>
      </div>
    ),
  },
];

const AUTO_PLAY_INTERVAL = 5500; // 5.5 seconds per slide

export function AuthCinematicShowcase() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  const currentSlide = SLIDES[currentSlideIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle auto-advance and smooth progress bar
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 50; // update progress every 50ms
    const totalSteps = AUTO_PLAY_INTERVAL / stepTime;
    let stepCount = 0;

    progressIntervalRef.current = setInterval(() => {
      stepCount += 1;
      setProgress(Math.min(100, (stepCount / totalSteps) * 100));
    }, stepTime);

    timerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
      stepCount = 0;
      setProgress(0);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentSlideIndex, isPaused]);

  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
    setProgress(0);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  };

  return (
    <div 
      className="hidden lg:flex lg:col-span-6 flex-col justify-between p-5 sm:p-6 text-white relative overflow-hidden select-none group min-h-[460px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="عرض توضيحي لخطوات المنصة"
    >
      {/* Dynamic Background Gradient with Smooth Cross-fade */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradientTheme} transition-colors duration-1000 ease-in-out`}
      />

      {/* Cinematic Ambient Glow Lights */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: currentSlide.glowColor }}
      />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Mesh Grid Pattern for Academic High-Tech Feel */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
      />

      {/* Cinematic Slide Images with Smooth Crossfade & Ken-Burns Zoom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlideIndex ? 'opacity-35 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            } transition-transform duration-7000`}
          >
            <Image
              src={slide.imageSrc}
              alt={slide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority={idx === 0}
            />
            {/* Vignette gradients to keep text high contrast and readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40" />
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 1. TOP HEADER: University Emblem & Live Slide Progress Bar     */}
      {/* ============================================================== */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-white shadow-md shadow-blue-950/50 flex items-center justify-center p-1 shrink-0">
            <Image
              src="/logo.png"
              alt="شعار كلية الذكاء الاصطناعي"
              width={32}
              height={32}
              className="w-full h-full object-contain select-none"
              priority
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              كلية الذكاء الاصطناعي
            </h3>
            <p className="text-[10px] text-blue-200/90 font-medium">جامعة المستقبل • دليل الاستخدام</p>
          </div>
        </div>

        {/* Slide Counter & Pause/Play Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono text-blue-200/80 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {currentSlideIndex + 1} / {SLIDES.length}
          </span>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 flex items-center justify-center transition-colors cursor-pointer"
            title={isPaused ? 'تشغيل العرض التلقائي' : 'إيقاف مؤقت'}
            aria-label={isPaused ? 'تشغيل' : 'إيقاف مؤقت'}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          </button>
        </div>
      </div>

      {/* Thin Synchronized Cinematic Progress Bar */}
      <div className="relative z-10 w-full h-1 bg-white/10 rounded-full overflow-hidden my-3">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-blue-400 transition-all duration-75 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ============================================================== */}
      {/* 2. CENTER CONTENT: Dynamic Slide with Animated Reveal          */}
      {/* ============================================================== */}
      <div 
        key={currentSlide.id} 
        className="relative z-10 my-auto py-2 space-y-3 animate-fadeIn"
      >
        {/* Step Badge Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-blue-200 text-[10px] font-extrabold border border-white/15 backdrop-blur-md">
          {currentSlide.badgeIcon}
          <span>{currentSlide.stepBadge}</span>
        </div>

        {/* Slide Title */}
        <h2 className="text-lg xl:text-xl font-extrabold tracking-tight text-white leading-snug">
          {currentSlide.title}
        </h2>

        {/* Slide Description */}
        <p className="text-xs text-blue-100/90 leading-relaxed max-w-sm">
          {currentSlide.description}
        </p>

        {/* Interactive Interactive Preview Card */}
        <div className="pt-1">
          {currentSlide.mockup}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM CONTROLS: Dots Navigation & Next/Prev Arrows         */}
      {/* ============================================================== */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
        {/* Step Indicators / Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive 
                    ? 'w-7 h-2 bg-gradient-to-r from-amber-400 to-blue-400' 
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`الانتقال إلى ${slide.stepBadge}`}
                aria-label={`الشريحة ${idx + 1}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>

        {/* Arrows for Manual Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="السابق"
            aria-label="الشريحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="التالي"
            aria-label="الشريحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
