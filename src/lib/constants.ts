/** Carrier color mapping for Mexican telecom companies */
export const CARRIER_COLORS: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  telcel: {
    border: 'border-blue-500/60',
    text: 'text-blue-400',
    bg: 'bg-blue-500/15',
    glow: 'shadow-blue-500/20',
  },
  movistar: {
    border: 'border-green-500/60',
    text: 'text-green-400',
    bg: 'bg-green-500/15',
    glow: 'shadow-green-500/20',
  },
  'at&t': {
    border: 'border-sky-400/60',
    text: 'text-sky-400',
    bg: 'bg-sky-400/15',
    glow: 'shadow-sky-400/20',
  },
  att: {
    border: 'border-sky-400/60',
    text: 'text-sky-400',
    bg: 'bg-sky-400/15',
    glow: 'shadow-sky-400/20',
  },
  bait: {
    border: 'border-purple-500/60',
    text: 'text-purple-400',
    bg: 'bg-purple-500/15',
    glow: 'shadow-purple-500/20',
  },
  unefon: {
    border: 'border-orange-500/60',
    text: 'text-orange-400',
    bg: 'bg-orange-500/15',
    glow: 'shadow-orange-500/20',
  },
  virgin: {
    border: 'border-red-500/60',
    text: 'text-red-400',
    bg: 'bg-red-500/15',
    glow: 'shadow-red-500/20',
  },
};

export const DEFAULT_CARRIER_COLORS = {
  border: 'border-zinc-500/60',
  text: 'text-zinc-400',
  bg: 'bg-zinc-500/15',
  glow: 'shadow-zinc-500/20',
};

export function getCarrierColors(compania: string) {
  const key = compania.toLowerCase().trim();
  return CARRIER_COLORS[key] ?? DEFAULT_CARRIER_COLORS;
}

/** Platform → domain mapping for Clearbit logo API */
export const PLATFORM_DOMAINS: Record<string, string> = {
  whatsapp: 'whatsapp.com',
  amazon: 'amazon.com',
  tiktok: 'tiktok.com',
  shein: 'shein.com',
  facebook: 'facebook.com',
  instagram: 'instagram.com',
  telegram: 'telegram.org',
  twitter: 'twitter.com',
  x: 'twitter.com',
  snapchat: 'snapchat.com',
  spotify: 'spotify.com',
  netflix: 'netflix.com',
  uber: 'uber.com',
  didi: 'didiglobal.com',
  rappi: 'rappi.com',
  mercadolibre: 'mercadolibre.com',
  'mercado libre': 'mercadolibre.com',
  gmail: 'gmail.com',
  outlook: 'outlook.com',
  yahoo: 'yahoo.com',
  linkedin: 'linkedin.com',
  pinterest: 'pinterest.com',
  discord: 'discord.com',
  youtube: 'youtube.com',
  twitch: 'twitch.tv',
  paypal: 'paypal.com',
  steam: 'steampowered.com',
  apple: 'apple.com',
  icloud: 'icloud.com',
  'google': 'google.com',
  line: 'line.me',
  wechat: 'wechat.com',
  signal: 'signal.org',
  reddit: 'reddit.com',
  wish: 'wish.com',
  aliexpress: 'aliexpress.com',
  temu: 'temu.com',
  threads: 'threads.net',
  banorte: 'banorte.com',
  bbva: 'bbva.mx',
  santander: 'santander.com.mx',
  nu: 'nu.com.mx',
  'nu bank': 'nu.com.mx',
  stori: 'storicard.com',
  coppel: 'coppel.com',
  liverpool: 'liverpool.com.mx',
};

export function getPlatformLogoUrl(plataforma: string): string {
  const key = plataforma.toLowerCase().trim();
  const domain = PLATFORM_DOMAINS[key] ?? `${key}.com`;
  return `https://logo.clearbit.com/${domain}`;
}
