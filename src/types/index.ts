export type SlotConfig = 'ONE_PHYSICAL' | 'TWO_PHYSICAL' | 'ONE_PHYS_ONE_ESIM' | 'TWO_ESIM';
export type SimType = 'FISICA' | 'ESIM';

export interface Device {
  id: string;
  nombre: string;
  configuracionSlots: SlotConfig;
  createdAt: string;
  updatedAt: string;
  accounts: Account[];
  sims: Sim[];
}

export interface Account {
  id: string;
  dispositivoId: string;
  plataforma: string;
  usuarioEmail: string;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sim {
  id: string;
  tipo: SimType;
  numero: string;
  compania: string;
  registroGubernamental: boolean;
  ssidIccid: string | null;
  pin: string | null;
  puk: string | null;
  fechaUltimaRecarga: string | null;
  dispositivoId: string | null;
  imagenQr: string | null;
  createdAt: string;
  updatedAt: string;
  device?: Device | null;
}

export interface CreateDevicePayload {
  nombre: string;
  configuracionSlots: SlotConfig;
}

export interface CreateSimPayload {
  tipo: SimType;
  numero: string;
  compania: string;
  registroGubernamental?: boolean;
  ssidIccid?: string;
  pin?: string;
  puk?: string;
  fechaUltimaRecarga?: string | null;
  dispositivoId?: string | null;
  imagenQr?: string;
}

export interface CreateAccountPayload {
  dispositivoId: string;
  plataforma: string;
  usuarioEmail: string;
  notas?: string;
}

export const SLOT_CONFIG_LABELS: Record<SlotConfig, string> = {
  ONE_PHYSICAL: '1 Físico',
  TWO_PHYSICAL: '2 Físicos',
  ONE_PHYS_ONE_ESIM: '1 Físico + 1 eSIM',
  TWO_ESIM: '2 eSIM',
};

export const SLOT_CAPACITY: Record<SlotConfig, { physical: number; esim: number }> = {
  ONE_PHYSICAL: { physical: 1, esim: 0 },
  TWO_PHYSICAL: { physical: 2, esim: 0 },
  ONE_PHYS_ONE_ESIM: { physical: 1, esim: 1 },
  TWO_ESIM: { physical: 0, esim: 2 },
};
