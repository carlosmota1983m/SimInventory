import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, normalizeAnswer } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET /api/auth/recover?username=xxx — Retrieve the security question for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'El nombre de usuario es requerido' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { recoveryQuestion: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recoveryQuestion: user.recoveryQuestion });
  } catch (error) {
    console.error('Error in recover GET route:', error);
    return NextResponse.json(
      { error: 'Error al obtener la pregunta de seguridad', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/auth/recover — Verify safety answer and reset password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, recoveryAnswer, newPassword } = body;

    if (!username || !recoveryAnswer || !newPassword) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verify recovery answer
    const normalizedInputAnswer = normalizeAnswer(recoveryAnswer);
    const isAnswerCorrect = verifyPassword(normalizedInputAnswer, user.recoveryAnswer);

    if (!isAnswerCorrect) {
      return NextResponse.json(
        { error: 'La respuesta de seguridad es incorrecta' },
        { status: 400 }
      );
    }

    // Hash and update password
    const hashedNewPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in recover POST route:', error);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
