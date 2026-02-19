import { NextRequest, NextResponse } from 'next/server';
import { setOpsSessionCookie } from '@/lib/auth/ops-session';

export type AdminRole = 'admin' | 'employee';

interface AuthResult {
  success: boolean;
  role?: AdminRole;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    const employeePassword = process.env.EMPLOYEE_PASSWORD;

    // Check admin password first
    if (adminPassword && password === adminPassword) {
      await setOpsSessionCookie('admin');
      return NextResponse.json({
        success: true,
        role: 'admin' as AdminRole
      } as AuthResult);
    }

    // Check employee password
    if (employeePassword && password === employeePassword) {
      await setOpsSessionCookie('employee');
      return NextResponse.json({
        success: true,
        role: 'employee' as AdminRole
      } as AuthResult);
    }

    // No valid password configured
    if (!adminPassword && !employeePassword) {
      console.error('No admin passwords configured in environment');
      return NextResponse.json(
        { success: false, error: 'Admin access not configured' } as AuthResult,
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' } as AuthResult,
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' } as AuthResult,
      { status: 500 }
    );
  }
}
