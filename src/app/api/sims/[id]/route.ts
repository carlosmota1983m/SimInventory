import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sims/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sim = await prisma.sim.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!sim) {
      return NextResponse.json({ error: 'SIM not found' }, { status: 404 });
    }

    return NextResponse.json(sim);
  } catch (error) {
    console.error('Error fetching sim:', error);
    return NextResponse.json({ error: 'Error fetching sim' }, { status: 500 });
  }
}

// PUT /api/sims/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sim = await prisma.sim.update({
      where: { id },
      data: {
        tipo: body.tipo,
        numero: body.numero,
        compania: body.compania,
        registroGubernamental: body.registroGubernamental,
        ssidIccid: body.ssidIccid || null,
        pin: body.pin || null,
        puk: body.puk || null,
        fechaUltimaRecarga: body.fechaUltimaRecarga ? new Date(body.fechaUltimaRecarga) : null,
        dispositivoId: body.dispositivoId,
        imagenQr: body.imagenQr || null,
      },
      include: { device: true },
    });

    return NextResponse.json(sim);
  } catch (error) {
    console.error('Error updating sim:', error);
    return NextResponse.json({ error: 'Error updating sim' }, { status: 500 });
  }
}

// DELETE /api/sims/:id
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.sim.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sim:', error);
    return NextResponse.json({ error: 'Error deleting sim' }, { status: 500 });
  }
}
