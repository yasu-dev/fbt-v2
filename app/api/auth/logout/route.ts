import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'セッションが見つかりません' },
        { status: 401 }
      );
    }

    // ログアウト前にユーザー情報を取得
    const user = await AuthService.getUserFromRequest(request);
    
    await AuthService.logout(token);

    // ログアウトの活動ログを記録
    if (user) {
      const metadata = ActivityLogger.extractMetadataFromRequest(request);
      await ActivityLogger.logAuth('logout', user.id, {
        ...metadata,
        email: user.email,
        role: user.role,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'ログアウト処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}