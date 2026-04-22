'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Sim, CreateSimPayload } from '@/types';

export function useSims() {
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sims');
      if (!res.ok) throw new Error('Failed to fetch sims');
      const data = await res.json();
      setSims(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSims();
  }, [fetchSims]);

  const createSim = async (payload: CreateSimPayload) => {
    const res = await fetch('/api/sims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create SIM');
    await fetchSims();
  };

  const updateSim = async (id: string, payload: Partial<CreateSimPayload>) => {
    const res = await fetch(`/api/sims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update SIM');
    await fetchSims();
  };

  const deleteSim = async (id: string) => {
    const res = await fetch(`/api/sims/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete SIM');
    await fetchSims();
  };

  const assignSim = async (simId: string, dispositivoId: string) => {
    const res = await fetch(`/api/sims/${simId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispositivoId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to assign SIM');
    }
    await fetchSims();
  };

  const unlinkSim = async (simId: string) => {
    const res = await fetch(`/api/sims/${simId}/unlink`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to unlink SIM');
    await fetchSims();
  };

  const drawerSims = sims.filter((s) => !s.dispositivoId);
  const assignedSims = sims.filter((s) => s.dispositivoId);

  return { sims, drawerSims, assignedSims, loading, error, fetchSims, createSim, updateSim, deleteSim, assignSim, unlinkSim };
}
