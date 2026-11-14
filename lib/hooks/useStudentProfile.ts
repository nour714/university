'use client';

import { useState, useEffect } from 'react';
import { StudentProfile } from '@/types/student';

let cachedProfile: StudentProfile | null = null;
let inFlightPromise: Promise<StudentProfile | null> | null = null;

export function useStudentProfile() {
  const [student, setStudent] = useState<StudentProfile | null>(cachedProfile);
  const [loading, setLoading] = useState<boolean>(!cachedProfile);

  useEffect(() => {
    let mounted = true;
    if (cachedProfile) {
      setStudent(cachedProfile);
      setLoading(false);
      return;
    }

    if (!inFlightPromise) {
      inFlightPromise = fetch('/api/student/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.student) {
            cachedProfile = data.student;
            return data.student as StudentProfile;
          }
          return null;
        })
        .catch(() => null)
        .finally(() => {
          inFlightPromise = null;
        });
    }

    inFlightPromise
      .then((profile) => {
        if (mounted && profile) {
          setStudent(profile);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { student, loading };
}
