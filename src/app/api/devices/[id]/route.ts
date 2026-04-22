import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/devices/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const device = await prisma.device.findUnique({
      where: { id },
      include: { accounts: true, sims: true },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json({ error: 'Error fetching device' }, { status: 500 });
  }
}

// PUT /api/devices/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, configuracionSlots } = body;

    const device = await prisma.device.update({
      where: { id },
      data: { nombre, configuracionSlots },
      include: { accounts: true, sims: true },
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json({ error: 'Error updating device' }, { status: 500 });
  }
}

// DELETE /api/devices/:id — cascades accounts, unlinks sims
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // First unlink all SIMs from this device (move to cajón)
    await prisma.sim.updateMany({
      where: { dispositivoId: id },
      data: { dispositivoId: null },
    });

    // Delete device (cascades accounts)
    await prisma.device.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json({ error: 'Error deleting device' }, { status: 500 });
  }
}
