import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/accounts/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Error fetching account' }, { status: 500 });
  }
}

// PUT /api/accounts/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const account = await prisma.account.update({
      where: { id },
      data: {
        plataforma: body.plataforma,
        usuarioEmail: body.usuarioEmail,
        notas: body.notas || null,
        dispositivoId: body.dispositivoId,
      },
      include: { device: true },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Error updating account' }, { status: 500 });
  }
}

// DELETE /api/accounts/:id
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
  }
}
