import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SLOT_CAPACITY } from '@/types';

export const dynamic = 'force-dynamic';


// PATCH /api/sims/:id/assign — assign a SIM to a device slot
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dispositivoId } = body;

    if (!dispositivoId) {
      return NextResponse.json({ error: 'dispositivoId is required' }, { status: 400 });
    }

    // Get the SIM
    const sim = await prisma.sim.findUnique({ where: { id } });
    if (!sim) {
      return NextResponse.json({ error: 'SIM not found' }, { status: 404 });
    }

    // Get the target device with its current SIMs
    const device = await prisma.device.findUnique({
      where: { id: dispositivoId },
      include: { sims: true },
    });
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Validate slot capacity
    const capacity = SLOT_CAPACITY[device.configuracionSlots];
    const currentPhysical = device.sims.filter((s) => s.tipo === 'FISICA').length;
    const currentEsim = device.sims.filter((s) => s.tipo === 'ESIM').length;

    if (sim.tipo === 'FISICA' && currentPhysical >= capacity.physical) {
      return NextResponse.json({ error: 'No hay slots físicos disponibles en este dispositivo' }, { status: 400 });
    }

    if (sim.tipo === 'ESIM' && currentEsim >= capacity.esim) {
      return NextResponse.json({ error: 'No hay slots eSIM disponibles en este dispositivo' }, { status: 400 });
    }

    // Assign SIM to device
    const updatedSim = await prisma.sim.update({
      where: { id },
      data: { dispositivoId },
      include: { device: true },
    });

    return NextResponse.json(updatedSim);
  } catch (error) {
    console.error('Error assigning sim:', error);
    return NextResponse.json({ error: 'Error assigning sim' }, { status: 500 });
  }
}
