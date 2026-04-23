import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


// GET /api/accounts — list all accounts
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: { device: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Error fetching accounts' }, { status: 500 });
  }
}

// POST /api/accounts — create a new account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dispositivoId, plataforma, usuarioEmail, notas } = body;

    if (!dispositivoId || !plataforma || !usuarioEmail) {
      return NextResponse.json({ error: 'dispositivoId, plataforma, and usuarioEmail are required' }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        dispositivoId,
        plataforma,
        usuarioEmail,
        notas: notas || null,
      },
      include: { device: true },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Error creating account' }, { status: 500 });
  }
}
