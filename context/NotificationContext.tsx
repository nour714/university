'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AcademicNotification } from '@/types/notification';
import { safeInternalPath } from '@/lib/safeUrl';
import { listNotifications, saveNotifications } from '@/lib/repos/notificationsRepo';

interface NotificationContextType {
  notifications: AcademicNotification[];
  unreadCount: number;
  toast: AcademicNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notif: Partial<AcademicNotification> & { title: string; message: string; type: AcademicNotification['type'] }) => void;
  simulateLectureNotification: () => void;
  simulateExamNotification: () => void;
  resetAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API helper for a clean, subtle academic notification chime
function playNotificationSound() {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a gentle two-tone chime (E5 -> B5)
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12); // B5
    gain2.gain.setValueAtTime(0.09, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

function generateNotificationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AcademicNotification[]>([]);
  const [toast, setToast] = useState<AcademicNotification | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from repo
  useEffect(() => {
    let mounted = true;
    listNotifications().then((loaded) => {
      if (mounted) {
        setNotifications(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save via repo when changed
  useEffect(() => {
    if (!isLoaded) return;
    saveNotifications(notifications);
  }, [notifications, isLoaded]);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notif: Partial<AcademicNotification> & { title: string; message: string; type: AcademicNotification['type'] }) => {
      const newNotif: AcademicNotification = {
        id: generateNotificationId(),
        type: notif.type,
        title: notif.title,
        message: notif.message,
        courseCode: notif.courseCode,
        courseName: notif.courseName,
        courseId: notif.courseId,
        timeAgo: 'الآن',
        createdAt: new Date().toISOString(),
        isRead: false,
        priority: notif.priority || 'urgent',
        actionUrl: safeInternalPath(notif.actionUrl || '/courses'),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setToast(newNotif);
      playNotificationSound();
    },
    []
  );

  // Interactive simulators to verify lecture and exam notifications
  const simulateLectureNotification = useCallback(() => {
    const lectureSamples = [
      {
        title: 'محاضرة جديدة تم رفعها: الشبكات التوليدية التخاصمية (GANs)',
        message: 'قام أ.د. طارق الحصري بإضافة فيديو وسلايدات المحاضرة 05 لمقرر تعلم الآلة المتقدم (AI301).',
        courseCode: 'AI301',
        courseName: 'تعلم الآلة المتقدم',
        courseId: 'ai-301',
        actionUrl: '/courses/ai-301',
      },
      {
        title: 'تسجيل جديد متاح: شبكات الانتباه والمحولات (Attention & Transformers)',
        message: 'تم رفع التسجيل الصوتي وشرح الكود العملي لمقرر معالجة اللغات الطبيعية (AI401).',
        courseCode: 'AI401',
        courseName: 'معالجة اللغات الطبيعية',
        courseId: 'ai-401',
        actionUrl: '/courses/ai-401',
      },
      {
        title: 'محاضرة تفاعلية جديدة: تدريب نماذج الرؤية الحاسوبية (YOLOv8)',
        message: 'أضافت د. ريم سليمان ملفات التدريب العملي في مقرر الرؤية الحاسوبية (AI303).',
        courseCode: 'AI303',
        courseName: 'الرؤية الحاسوبية ومعالجة الصور',
        courseId: 'ai-303',
        actionUrl: '/courses/ai-303',
      },
    ];

    const sample = lectureSamples[Math.floor(Math.random() * lectureSamples.length)];
    addNotification({
      type: 'lecture',
      title: sample.title,
      message: sample.message,
      courseCode: sample.courseCode,
      courseName: sample.courseName,
      courseId: sample.courseId,
      actionUrl: sample.actionUrl,
      priority: 'urgent',
    });
  }, [addNotification]);

  const simulateExamNotification = useCallback(() => {
    const examSamples = [
      {
        title: 'تنبيه اختبار: جدول الميدتيرم لمقرر التعلم العميق (AI302)',
        message: 'تقرر عقد اختبار الميدتيرم لمقرر التعلم العميق يوم الثلاثاء القادم الساعة 11:30 صباحاً في مدرج الكلية.',
        courseCode: 'AI302',
        courseName: 'التعلم العميق والشبكات العصبية',
        courseId: 'ai-302',
        actionUrl: '/courses/ai-302',
      },
      {
        title: 'كويز أونلاين: اختبار قصير في معالجة الإشارات الرقمية',
        message: 'تم تفعيل الكويز الأسبوعي، مدة الاختبار 20 دقيقة، متاح للحل حتى الساعة 08:00 مساءً.',
        courseCode: 'AI301',
        courseName: 'تعلم الآلة المتقدم',
        courseId: 'ai-301',
        actionUrl: '/courses/ai-301',
      },
      {
        title: 'موعد المناقشة العملية لمشاريع المادة (Lab Evaluation)',
        message: 'حدد قسم الذكاء الاصطناعي مواعيد تسليم المشاريع العملية للاختبار العملي النهائي.',
        courseCode: 'AI401',
        courseName: 'معالجة اللغات الطبيعية',
        courseId: 'ai-401',
        actionUrl: '/courses/ai-401',
      },
    ];

    const sample = examSamples[Math.floor(Math.random() * examSamples.length)];
    addNotification({
      type: 'exam',
      title: sample.title,
      message: sample.message,
      courseCode: sample.courseCode,
      courseName: sample.courseName,
      courseId: sample.courseId,
      actionUrl: sample.actionUrl,
      priority: 'urgent',
    });
  }, [addNotification]);

  const resetAll = useCallback(() => {
    setNotifications([]);
    setToast(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        removeNotification,
        addNotification,
        simulateLectureNotification,
        simulateExamNotification,
        resetAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

