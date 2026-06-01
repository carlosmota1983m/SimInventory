'use client';

import { useState } from 'react';

interface CarrierIconProps {
  compania: string;
  size?: number;
  className?: string;
}

export default function CarrierIcon({ compania, size = 16, className = '' }: CarrierIconProps) {
  const [imgError, setImgError] = useState(false);
  const normalizedCarrier = compania.toLowerCase().trim().replace('at&t', 'att');
  const logoUrl = `/carriers/${normalizedCarrier}.svg`;

  if (imgError || !['telcel', 'movistar', 'att', 'bait', 'unefon', 'virgin'].includes(normalizedCarrier)) {
    return (
      <div
        className={`rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white leading-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        title={compania}
      >
        {compania[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={compania}
      width={size}
      height={size}
      className={`rounded object-cover bg-white/5 p-0.5 flex-shrink-0 ${className}`}
      onError={() => setImgError(true)}
      title={compania}
    />
  );
}
