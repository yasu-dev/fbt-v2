import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';


const mockWarehouses = [
  {
    id: 'warehouse-001',
    code: 'D-ATW-01',
    name: 'アラウンド・ザ・ワールド株式会社 営業倉庫',
    zone: 'D',
    address: '東京都江戸川区臨海町3-6-4 ヒューリック葛西臨海ビル5階',
    phone: '03-5542-0411',
    email: 'info@around-the-world.com',
    notes: '',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'warehouse-002',
    code: 'D-TWD-01',
    name: '株式会社THE WORLD DOOR 営業倉庫',
    zone: 'D',
    address: '神奈川県相模原市南区相模大野3-13-15 第3タカビル6階',
    phone: '042-705-1966',
    email: 'info@the-world-door.com',
    notes: '',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export async function GET() {
  try {
    // 現在はモックデータを返す
    console.log('Using mock data for delivery warehouses');
    return NextResponse.json(mockWarehouses);
  } catch (error) {
    console.error('Delivery warehouse fetch error:', error);
    return NextResponse.json(
      { error: '配送先倉庫取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, phone, email, notes } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: '倉庫名と住所は必須です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    const newWarehouse = {
      id: 'mock-' + Date.now(),
      code: `D-MOCK-${Date.now()}`,
      name,
      zone: 'D',
      address,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      warehouse: newWarehouse,
      message: '倉庫が正常に作成されました（デモモード）'
    }, { status: 201 });

  } catch (error) {
    console.error('Delivery warehouse creation error:', error);
    return NextResponse.json(
      { error: '倉庫作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, address, phone, email, notes, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: '倉庫IDが必要です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    const updatedWarehouse = {
      id,
      code: `D-UPDATED-${Date.now()}`,
      name: name || 'テスト倉庫',
      zone: 'D',
      address: address || 'テスト住所',
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      warehouse: updatedWarehouse,
      message: '倉庫情報が正常に更新されました（デモモード）'
    });

  } catch (error) {
    console.error('Delivery warehouse update error:', error);
    return NextResponse.json(
      { error: '倉庫更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['staff', 'admin']);
    if (!user) {
      return NextResponse.json(
        { error: '権限が不足しています' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '倉庫IDが必要です' },
        { status: 400 }
      );
    }

    // モックの場合は成功として扱う
    return NextResponse.json({ 
      success: true,
      message: '倉庫が正常に削除されました（デモモード）'
    });

  } catch (error) {
    console.error('Delivery warehouse deletion error:', error);
    return NextResponse.json(
      { error: '倉庫削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 