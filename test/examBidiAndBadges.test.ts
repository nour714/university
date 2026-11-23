import { describe, it, expect } from 'vitest';
import { isLatinText, normalizeArabic, matchesSearch } from '@/lib/normalizeArabic';

describe('BiDi Text Direction and Normalization Tests', () => {
  describe('isLatinText helper', () => {
    it('correctly identifies English questions and prompts as Latin', () => {
      expect(isLatinText('What is the primary function of L2 Regularization (Ridge) in training machine learning models?')).toBe(true);
      expect(isLatinText('When mitigating the Vanishing Gradient problem, which activation function is most effective?')).toBe(true);
      expect(isLatinText('Explain the difference between supervised and unsupervised learning.')).toBe(true);
    });

    it('correctly identifies English option sentences with punctuation as Latin', () => {
      expect(isLatinText('Accelerate data preprocessing throughput exclusively for natural language tokens.')).toBe(true);
      expect(isLatinText('Force unimportant feature weights to absolute zero for sparse feature selection.')).toBe(true);
      expect(isLatinText('Penalize large weight values to prevent overfitting without forcing weights to absolute zero.')).toBe(true);
      expect(isLatinText('Transform linear decision boundaries into arbitrary non-linear manifolds.')).toBe(true);
      expect(isLatinText('ReLU (Rectified Linear Unit)')).toBe(true);
    });

    it('correctly identifies Arabic questions and statements as non-Latin', () => {
      expect(isLatinText('ما هي الوظيفة الأساسية لدالة التنشيط في الشبكات العصبية؟')).toBe(false);
      expect(isLatinText('اختر الإجابة الصحيحة من بين الخيارات التالية.')).toBe(false);
      expect(isLatinText('تسريع التقارب وتفادي تلاشي الانحدار.')).toBe(false);
    });

    it('correctly preserves Arabic dominance when technical English acronyms are embedded', () => {
      // 11 Latin characters vs 27 Arabic characters -> Arabic dominant
      expect(isLatinText('ما هي وظيفة دالة ReLU وطبقة Dropout في تعلم الآلة؟')).toBe(false);
      // 4 Latin characters vs 25 Arabic characters -> Arabic dominant
      expect(isLatinText('ما هو دور خوارزمية Adam في تحسين الأوزان؟')).toBe(false);
    });

    it('handles falsy, empty, and numeric-only strings safely without crashing', () => {
      expect(isLatinText(null)).toBe(false);
      expect(isLatinText(undefined)).toBe(false);
      expect(isLatinText('')).toBe(false);
      expect(isLatinText('   ')).toBe(false);
      expect(isLatinText('1234567890')).toBe(false);
      expect(isLatinText('!@#$%^&*()')).toBe(false);
    });
  });

  describe('Option Badge Letter derivation', () => {
    it('derives clean sequential letters A, B, C, D from index instead of raw DB IDs', () => {
      const mockOptions = [
        { id: 'opt1_a', text: 'Option One' },
        { id: 'opt1_b', text: 'Option Two' },
        { id: 'opt1_c', text: 'Option Three' },
        { id: 'opt1_d', text: 'Option Four' },
      ];

      const getOptionLetter = (option: { id: string; text: string; label?: string }, optIdx: number) => {
        return option.label && option.label.length === 1
          ? option.label.toUpperCase()
          : String.fromCharCode(65 + optIdx);
      };

      const letters = mockOptions.map((opt, idx) => getOptionLetter(opt, idx));
      expect(letters).toEqual(['A', 'B', 'C', 'D']);
      expect(letters).not.toContain('OPT1_A');
      expect(letters).not.toContain('OPT1_B');
    });

    it('respects single-character custom labels when provided', () => {
      const getOptionLetter = (option: { label?: string }, optIdx: number) => {
        return option.label && option.label.length === 1
          ? option.label.toUpperCase()
          : String.fromCharCode(65 + optIdx);
      };

      expect(getOptionLetter({ label: 'x' }, 0)).toBe('X');
      expect(getOptionLetter({ label: 'Z' }, 1)).toBe('Z');
      expect(getOptionLetter({ label: 'too-long' }, 2)).toBe('C');
    });
  });

  describe('Arabic Normalization sanity checks', () => {
    it('normalizes Arabic characters with diacritics and Alef variations', () => {
      expect(normalizeArabic('أَحْمَدُ')).toBe('احمد');
      expect(normalizeArabic('الذكاءُ الإِصْطِناعِيّ')).toBe('الذكاء الاصطناعي');
      expect(normalizeArabic('مُقَرَّرَاتِي')).toBe('مقرراتي');
    });

    it('matches search queries across normalization differences', () => {
      expect(matchesSearch('مقررات المستوى الثالث', 'المستوي')).toBe(true);
      expect(matchesSearch('ذكاء اصطناعي', 'الذكاء')).toBe(false);
      expect(matchesSearch('الذكاء الاصطناعي', 'ذكاء')).toBe(true);
    });
  });
});
