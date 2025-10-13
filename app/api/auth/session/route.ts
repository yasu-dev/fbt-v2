import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getUserFromRequest(request);

    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          address: user.address
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Not authenticated'
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check session'
    }, { status: 500 });
  }
}