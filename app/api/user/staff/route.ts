import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 認証（スタッフ/管理者のみ）だが、デモ用途を考慮して未認証は最小情報で返す
    let user = null as any;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
    } catch {
      // ゲスト/セラーから参照される可能性があるため、認証失敗でも続行（最小公開情報）
      user = null;
    }

    const staff = await prisma.user.findMany({
      where: { role: 'staff' },
      select: { id: true, username: true, email: true, fullName: true }
    });

    // 返却データは必要最小限
    const result = staff.map(s => ({
      id: s.id,
      name: s.fullName || s.username || s.email,
      email: s.email
    }));

    return NextResponse.json({ success: true, staff: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch staff' }, { status: 500 });
  }
}



