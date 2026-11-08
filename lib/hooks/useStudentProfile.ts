'use client';

import { useState, useEffect } from 'react';
import { StudentProfile } from '@/types/student';

let cachedProfile: StudentProfile | null = null;

export function useStudentProfile() {
  const [student, setStudent] = useState<StudentProfile | null>(cachedProfile);
  const [loading, setLoading] = useState<boolean>(!cachedProfile);

  useEffect(() => {
    let mounted = true;
    if (cachedProfile) {
      return;
    }

    fetch('/api/student/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.student) {
          cachedProfile = data.student;
          setStudent(data.student);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { student, loading };
}
