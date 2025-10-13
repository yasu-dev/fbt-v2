import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';

const prisma = new PrismaClient();

// GET: システム設定一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const type = searchParams.get('type');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (key) {
      where.key = key;
    }
    if (type) {
      where.type = type;
    }
    if (!includeInactive) {
      where.isActive = true;
    }

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        type: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 型に応じて値をパース
    const parsedSettings = settings.map(setting => {
      let parsedValue = setting.value;
      
      try {
        switch (setting.type) {
          case 'json':
            parsedValue = JSON.parse(setting.value);
            break;
          case 'number':
            parsedValue = Number(setting.value);
            break;
          case 'boolean':
            parsedValue = setting.value === 'true';
            break;
          default:
            parsedValue = setting.value;
        }
      } catch (error) {
        // パースエラーの場合は元の文字列を返す
        console.warn(`Failed to parse setting ${setting.key}:`, error);
        parsedValue = setting.value;
      }

      return {
        ...setting,
        parsedValue,
      };
    });

    // 単一設定の場合は直接返す
    if (key && parsedSettings.length === 1) {
      return NextResponse.json({
        success: true,
        data: parsedSettings[0],
      });
    }

    return NextResponse.json({
      success: true,
      data: parsedSettings,
      count: parsedSettings.length,
    });

  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: システム設定作成
export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['admin']);
    const body = await request.json();
    const { key, value, description, type } = body;

    // バリデーション
    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'key、valueは必須です' },
        { status: 400 }
      );
    }

    // 重複チェック
    const existing = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'このキーは既に存在します' },
        { status: 409 }
      );
    }

    // 値を文字列に変換
    let stringValue = value;
    if (type === 'json' && typeof value !== 'string') {
      stringValue = JSON.stringify(value);
    } else if (typeof value !== 'string') {
      stringValue = String(value);
    }

    const setting = await prisma.systemSetting.create({
      data: {
        key,
        value: stringValue,
        description: description || null,
        type: type || 'string',
        isActive: true,
      },
    });

    // システム設定作成の履歴を記録
    const metadata = ActivityLogger.extractMetadataFromRequest(request);
    await ActivityLogger.logDataChange(
      'setting',
      'create',
      setting.id,
      user.id,
      {
        oldValue: null,
        newValue: {
          key,
          value: stringValue,
          type: type || 'string',
          description,
        },
      },
      {
        ...metadata,
        createdBy: user.username,
        settingKey: key,
      }
    );

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'システム設定を作成しました',
    });

  } catch (error) {
    console.error('Error creating system setting:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: システム設定更新
export async function PUT(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['admin']);
    const body = await request.json();
    const { id, key, value, description, type, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    const existing = await prisma.systemSetting.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'システム設定が見つかりません' },
        { status: 404 }
      );
    }

    // キー重複チェック（自分以外）
    if (key && key !== existing.key) {
      const duplicate = await prisma.systemSetting.findUnique({
        where: { key },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'このキーは既に存在します' },
          { status: 409 }
        );
      }
    }

    // 値を文字列に変換
    let stringValue = existing.value;
    if (value !== undefined) {
      const settingType = type || existing.type;
      if (settingType === 'json' && typeof value !== 'string') {
        stringValue = JSON.stringify(value);
      } else if (typeof value !== 'string') {
        stringValue = String(value);
      } else {
        stringValue = value;
      }
    }

    const setting = await prisma.systemSetting.update({
      where: { id },
      data: {
        key: key || existing.key,
        value: stringValue,
        description: description !== undefined ? description : existing.description,
        type: type || existing.type,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    // システム設定更新の履歴を記録
    const metadata = ActivityLogger.extractMetadataFromRequest(request);
    await ActivityLogger.logSystemSettingChange(
      existing.key,
      existing.value,
      stringValue,
      user.id,
      {
        ...metadata,
        updatedBy: user.username,
        settingId: id,
        oldData: {
          key: existing.key,
          value: existing.value,
          description: existing.description,
          type: existing.type,
          isActive: existing.isActive,
        },
        newData: {
          key: key || existing.key,
          value: stringValue,
          description: description !== undefined ? description : existing.description,
          type: type || existing.type,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'システム設定を更新しました',
    });

  } catch (error) {
    console.error('Error updating system setting:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: システム設定削除（論理削除）
export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.requireRole(request, ['admin']);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'IDは必須です' },
        { status: 400 }
      );
    }

    // 削除前の設定情報を取得
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return NextResponse.json(
        { success: false, error: 'システム設定が見つかりません' },
        { status: 404 }
      );
    }

    const setting = await prisma.systemSetting.update({
      where: { id },
      data: { isActive: false },
    });

    // システム設定削除の履歴を記録
    const metadata = ActivityLogger.extractMetadataFromRequest(request);
    await ActivityLogger.logDataChange(
      'setting',
      'delete',
      id,
      user.id,
      {
        oldValue: {
          key: existingSetting.key,
          value: existingSetting.value,
          isActive: true,
        },
        newValue: {
          key: existingSetting.key,
          value: existingSetting.value,
          isActive: false,
        },
      },
      {
        ...metadata,
        deletedBy: user.username,
        settingKey: existingSetting.key,
        action: 'logical_delete',
      }
    );

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'システム設定を削除しました',
    });

  } catch (error) {
    console.error('Error deleting system setting:', error);
    return NextResponse.json(
      { success: false, error: 'システム設定の削除に失敗しました' },
      { status: 500 }
    );
  }
}