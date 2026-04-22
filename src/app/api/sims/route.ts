import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sims — list all sims with optional device info
export async function GET() {
  try {
    const sims = await prisma.sim.findMany({
      include: { device: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sims);
  } catch (error) {
    console.error('Error fetching sims:', error);
    return NextResponse.json({ error: 'Error fetching sims' }, { status: 500 });
  }
}

// POST /api/sims — create a new SIM
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, numero, compania, registroGubernamental, ssidIccid, pin, puk, fechaUltimaRecarga, dispositivoId, imagenQr } = body;

    if (!tipo || !numero || !compania) {
      return NextResponse.json({ error: 'tipo, numero, and compania are required' }, { status: 400 });
    }

    const sim = await prisma.sim.create({
      data: {
        tipo,
        numero,
        compania,
        registroGubernamental: registroGubernamental ?? false,
        ssidIccid: ssidIccid || null,
        pin: pin || null,
        puk: puk || null,
        fechaUltimaRecarga: fechaUltimaRecarga ? new Date(fechaUltimaRecarga) : null,
        dispositivoId: dispositivoId || null,
        imagenQr: imagenQr || null,
      },
      include: { device: true },
    });

    return NextResponse.json(sim, { status: 201 });
  } catch (error) {
    console.error('Error creating sim:', error);
    return NextResponse.json({ error: 'Error creating sim' }, { status: 500 });
  }
}
