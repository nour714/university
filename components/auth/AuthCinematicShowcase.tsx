'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Slide {
  id: number;
  imageSrc: string;
  altText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    imageSrc: '/onboarding/slide-1.jpg',
    altText: 'بوابة كلية الذكاء الاصطناعي - جامعة كفر الشيخ - تسجيل الدخول',
  },
  {
    id: 2,
    imageSrc: '/onboarding/slide-2.jpg',
    altText: 'تفعيل أكواد المقررات الأكاديمية',
  },
  {
    id: 3,
    imageSrc: '/onboarding/slide-3.jpg',
    altText: 'المحاضرات التفاعلية والاختبارات الأكاديمية',
  },
];

const AUTO_PLAY_INTERVAL = 4000; // 4 seconds auto-switch between slides

export function AuthCinematicShowcase() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic slide switching (التبديل التلقائي للصور)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Manual navigation handlers
  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div 
      className="hidden lg:flex flex-1 relative overflow-hidden select-none group min-h-[460px] bg-slate-950 rounded-l-2xl sm:rounded-l-3xl"
      role="region"
      aria-label="عرض الصور الأكاديمي"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ============================================================== */}
      {/* 1. CRYSTAL-CLEAR SLIDE IMAGES (SMOOTH CROSSFADE TRANSITION)   */}
      {/* ============================================================== */}
      <div className="absolute inset-0 overflow-hidden">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.imageSrc}
                alt={slide.altText}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center scale-100"
                priority={idx === 0}
              />
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 2. TOP FLOATING NAVIGATION ARROWS: ONE RIGHT, ONE LEFT         */}
      {/* ============================================================== */}
      {/* Right Navigation Arrow (أعلى اليمين) */}
      <div className="absolute top-4 right-5 z-20">
        <button
          type="button"
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 hover:scale-105"
          title="الصورة السابقة"
          aria-label="الصورة السابقة"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Left Navigation Arrow (أعلى الشمال) */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90 hover:scale-105"
          title="الصورة التالية"
          aria-label="الصورة التالية"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. SUBTLE BOTTOM PILL INDICATORS                               */}
      {/* ============================================================== */}
      <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/15 shadow-lg">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive 
                    ? 'w-6 h-2 bg-gradient-to-r from-amber-400 to-blue-400' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                title={`الانتقال إلى صورة ${idx + 1}`}
                aria-label={`الصورة ${idx + 1}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
