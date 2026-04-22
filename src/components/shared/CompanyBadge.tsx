'use client';

import { getCarrierColors } from '@/lib/constants';

interface CompanyBadgeProps {
  compania: string;
  className?: string;
}

export default function CompanyBadge({ compania, className = '' }: CompanyBadgeProps) {
  const colors = getCarrierColors(compania);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${colors.border} ${colors.text} ${colors.bg} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.text} bg-current`} />
      {compania}
    </span>
  );
}
