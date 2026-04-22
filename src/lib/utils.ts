import { differenceInDays, addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Calculate recharge status for a SIM
 * Business rule: fecha_ultima_recarga + 90 days = expiry
 * If within 10 days of expiry → urgent alert
 */
export function getRechargeStatus(fechaUltimaRecarga: string | null): {
  daysUntilExpiry: number | null;
  expiryDate: Date | null;
  isUrgent: boolean;
  isExpired: boolean;
  label: string;
} {
  if (!fechaUltimaRecarga) {
    return {
      daysUntilExpiry: null,
      expiryDate: null,
      isUrgent: false,
      isExpired: false,
      label: 'Sin registro',
    };
  }

  const lastRecharge = new Date(fechaUltimaRecarga);
  const expiryDate = addDays(lastRecharge, 90);
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expiryDate, today);
  const isExpired = daysUntilExpiry <= 0;
  const isUrgent = daysUntilExpiry <= 10 && !isExpired;

  let label: string;
  if (isExpired) {
    label = `Vencido hace ${Math.abs(daysUntilExpiry)} días`;
  } else if (isUrgent) {
    label = `Vence en ${daysUntilExpiry} días`;
  } else {
    label = `${daysUntilExpiry} días restantes`;
  }

  return { daysUntilExpiry, expiryDate, isUrgent, isExpired, label };
}

/** Format a date for display */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return format(new Date(dateStr), "d 'de' MMM, yyyy", { locale: es });
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Generate initials from a platform name */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
