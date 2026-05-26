import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, normalizeAnswer } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, recoveryQuestion, recoveryAnswer } = body;

    if (!username || !password || !recoveryQuestion || !recoveryAnswer) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está registrado' },
        { status: 400 }
      );
    }

    // Hash password and recovery answer
    const hashedPassword = hashPassword(password);
    const hashedRecoveryAnswer = hashPassword(normalizeAnswer(recoveryAnswer));

    // Create user
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        recoveryQuestion: recoveryQuestion.trim(),
        recoveryAnswer: hashedRecoveryAnswer,
      },
    });

    return NextResponse.json(
      { success: true, username: user.username },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in register route:', error);
    return NextResponse.json(
      { error: 'Error al registrar el usuario' },
      { status: 500 }
    );
  }
}
