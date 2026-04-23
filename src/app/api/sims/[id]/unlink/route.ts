import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


// PATCH /api/sims/:id/unlink — remove SIM from device (move to Cajón)
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const sim = await prisma.sim.update({
      where: { id },
      data: { dispositivoId: null },
      include: { device: true },
    });

    return NextResponse.json(sim);
  } catch (error) {
    console.error('Error unlinking sim:', error);
    return NextResponse.json({ error: 'Error unlinking sim' }, { status: 500 });
  }
}
