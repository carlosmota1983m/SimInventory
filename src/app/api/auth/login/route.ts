import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      // Fallback for first-run context if no users exist in the DB
      const userCount = await prisma.user.count();
      if (userCount === 0 && normalizedUsername === 'admin' && password === 'admin123') {
        return NextResponse.json({ success: true, username: 'admin' });
      }

      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
