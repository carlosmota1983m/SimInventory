import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/devices — list all devices with related accounts and sims
export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        accounts: { orderBy: { createdAt: 'asc' } },
        sims: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Error fetching devices' }, { status: 500 });
  }
}

// POST /api/devices — create a new device
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, configuracionSlots } = body;

    if (!nombre || !configuracionSlots) {
      return NextResponse.json({ error: 'nombre and configuracionSlots are required' }, { status: 400 });
    }

    const device = await prisma.device.create({
      data: { nombre, configuracionSlots },
      include: { accounts: true, sims: true },
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error('Error creating device:', error);
    return NextResponse.json({ error: 'Error creating device' }, { status: 500 });
  }
}
