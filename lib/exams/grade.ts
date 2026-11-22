export interface GradeScale {
  label: string;
  colorClass: string;
  badgeClass: string;
}

/**
 * Maps an exam percentage score to its academic grade label and styling.
 *
 * Grade scale mapping:
 * - >= 85%: تقدير امتياز (emerald/green)
 * - >= 75%: تقدير جيد جداً (blue/teal)
 * - >= 65%: تقدير جيد (sky/blue)
 * - >= 50%: تقدير مقبول (amber)
 * - < 50%:  راسب (red)
 */
export function getGradeLabel(percentage: number): GradeScale {
  if (percentage >= 85) {
    return {
      label: 'تقدير امتياز',
      colorClass: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (percentage >= 75) {
    return {
      label: 'تقدير جيد جداً',
      colorClass: 'text-teal-600',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    };
  }
  if (percentage >= 65) {
    return {
      label: 'تقدير جيد',
      colorClass: 'text-sky-600',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    };
  }
  if (percentage >= 50) {
    return {
      label: 'تقدير مقبول',
      colorClass: 'text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    label: 'راسب',
    colorClass: 'text-red-600',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  };
}
