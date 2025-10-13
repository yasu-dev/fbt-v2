import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // APIルートのみを対象とする
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 特定のAPIエンドポイントをスキップ
  const skipPaths = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/session',
    '/api/debug',
    '/api/test',
    '/api/init-db',
  ];

  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // IPアドレスと追加のメタデータを設定
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor || realIp || 'unknown';
    
    const response = NextResponse.next();
    response.headers.set('x-client-ip', clientIp);
    response.headers.set('x-request-timestamp', new Date().toISOString());
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};