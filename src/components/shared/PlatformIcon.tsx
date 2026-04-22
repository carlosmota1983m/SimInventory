'use client';

import { useState } from 'react';
import { getPlatformLogoUrl } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { User } from 'lucide-react';

interface PlatformIconProps {
  plataforma: string;
  size?: number;
  className?: string;
}

export default function PlatformIcon({ plataforma, size = 32, className = '' }: PlatformIconProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getPlatformLogoUrl(plataforma);
  const initials = getInitials(plataforma);

  if (imgError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border border-white/10 text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        title={plataforma}
      >
        {initials || <User size={size * 0.5} />}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={plataforma}
      width={size}
      height={size}
      className={`rounded-full bg-white/10 object-cover ${className}`}
      onError={() => setImgError(true)}
      title={plataforma}
    />
  );
}
