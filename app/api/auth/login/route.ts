import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] ログインAPI開始');
    
    const body = await request.json();
    const { email, password } = body;

    console.log('[DEBUG] ログイン試行:', { email, password: '***' });

    if (!email || !password) {
      console.log('[DEBUG] 必須項目不足');
      return NextResponse.json(
        { success: false, error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // データベース接続を優先的に使用（固定認証は最後の手段）
    try {
      console.log('[DEBUG] AuthService.loginを呼び出し中...');
      const result = await AuthService.login(email, password);

      if (result) {
        console.log('[DEBUG] 認証成功:', result.user.email, result.user.role);
        
        // ログイン成功の活動ログを記録
        try {
          const metadata = ActivityLogger.extractMetadataFromRequest(request);
          await ActivityLogger.logAuth('login', result.user.id, {
            ...metadata,
            email: result.user.email,
            role: result.user.role,
            authMethod: 'database',
          });
        } catch (logError) {
          console.log('[DEBUG] アクティビティログ記録をスキップ:', logError);
        }
        
        const response = NextResponse.json({
          success: true,
          user: result.user,
        });

        // Set HTTP-only cookie for enhanced security
        response.cookies.set('auth-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 24 hours
          path: '/',
        });

        return response;
      } else {
        console.log('[DEBUG] 認証失敗 - データベースでユーザーが見つからない');
      }
    } catch (authError) {
      console.error('[ERROR] AuthService.loginでエラー:', authError);
      console.log('[DEBUG] フォールバック認証を試行中...');
    }

    // フォールバック: 固定認証（環境フラグで制御）
    const allowFixed = process.env.ALLOW_FIXED_AUTH === 'true';
    console.log('[DEBUG] 固定認証許可:', allowFixed);
    console.log('[DEBUG] 固定認証チェック:', email, password === 'password123' || password === 'password');
    const allowedEmails = ['seller@example.com', 'staff@example.com', 'admin@example.com', 'seller@test.com', 'staff@test.com'];
    const allowedPasswords = ['password123', 'password'];
    
    if (allowFixed && allowedEmails.includes(email) && allowedPasswords.includes(password)) {
      console.log('[DEBUG] 固定認証成功');
      
      const mockUsers = {
        'seller@example.com': {
          id: 'seller-1',
          email: 'seller@example.com',
          username: 'seller',
          role: 'seller',
          fullName: 'テストセラー',
          phoneNumber: '090-1234-5678',
          address: '東京都渋谷区1-1-1',
        },
        'staff@example.com': {
          id: 'staff-1',
          email: 'staff@example.com',
          username: 'staff',
          role: 'staff',
          fullName: 'テストスタッフ',
          phoneNumber: '090-1234-5679',
          address: '東京都渋谷区1-1-2',
        },
        'admin@example.com': {
          id: 'admin-1',
          email: 'admin@example.com',
          username: 'admin',
          role: 'admin',
          fullName: '管理者',
          phoneNumber: '090-1234-5680',
          address: '東京都渋谷区1-1-3',
        },
        'seller@test.com': {
          id: 'test-seller-001',
          email: 'seller@test.com',
          username: 'test-seller',
          role: 'seller',
          fullName: 'テストセラー',
          phoneNumber: '090-1234-5678',
          address: '東京都港区テスト1-2-3',
        },
        'staff@test.com': {
          id: 'test-staff-001',
          email: 'staff@test.com',
          username: 'test-staff',
          role: 'staff',
          fullName: 'テストスタッフ',
          phoneNumber: '090-8765-4321',
          address: '東京都渋谷区テスト4-5-6',
        }
      };

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      const mockToken = `fixed-auth-token-${mockUser.id}`;

      // ログイン成功の活動ログを記録（固定認証）
      try {
        const metadata = ActivityLogger.extractMetadataFromRequest(request);
        await ActivityLogger.logAuth('login', mockUser.id, {
          ...metadata,
          email: mockUser.email,
          role: mockUser.role,
          authMethod: 'fixed',
        });
      } catch (logError) {
        console.log('[DEBUG] アクティビティログ記録をスキップ:', logError);
      }

      const response = NextResponse.json({
        success: true,
        user: mockUser,
      });

      // Set HTTP-only cookie for enhanced security
      response.cookies.set('auth-token', mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return response;
    }

    console.log('[DEBUG] 全ての認証方法が失敗');
    
    // ログイン失敗の活動ログを記録
    try {
      const metadata = ActivityLogger.extractMetadataFromRequest(request);
      await ActivityLogger.logAuth('login_failed', null, {
        ...metadata,
        email,
        reason: 'invalid_credentials',
      });
    } catch (logError) {
      console.log('[DEBUG] アクティビティログ記録をスキップ:', logError);
    }
    
    return NextResponse.json(
      { success: false, error: 'メールアドレスまたはパスワードが間違っています' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[ERROR] ログイン処理エラー:', error);
    return NextResponse.json(
      { success: false, error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}