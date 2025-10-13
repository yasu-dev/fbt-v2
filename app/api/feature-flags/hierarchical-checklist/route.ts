import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 階層型検品チェックリストのフィーチャーフラグ管理API
 * 既存システムに一切影響を与えずに新システムの有効/無効を制御
 */

// フィーチャーフラグの初期化と取得
export async function GET(request: NextRequest) {
  try {
    console.log('[FEATURE FLAG] 階層型検品チェックリストのフィーチャーフラグ取得開始');
    
    // フィーチャーフラグの存在確認
    let flag = await prisma.systemSetting.findUnique({
      where: { key: 'hierarchical_inspection_checklist_enabled' }
    });

    // フラグが存在しない場合は作成（デフォルト: true - 階層型システム有効）
    if (!flag) {
      console.log('[FEATURE FLAG] フィーチャーフラグが存在しないため作成します');
      flag = await prisma.systemSetting.create({
        data: {
          key: 'hierarchical_inspection_checklist_enabled',
          value: 'true',
          description: '階層型検品チェックリストシステムの有効/無効を制御（true=新システム, false=既存システム）',
          type: 'boolean',
          isActive: true
        }
      });
      console.log('[FEATURE FLAG] フィーチャーフラグ作成完了:', flag.key);
    }

    // boolean値として解析
    const isEnabled = flag.value === 'true';

    console.log(`[FEATURE FLAG] 階層型検品チェックリスト: ${isEnabled ? '有効' : '無効'}`);

    return NextResponse.json({
      success: true,
      data: {
        enabled: isEnabled,
        key: flag.key,
        description: flag.description,
        lastUpdated: flag.updatedAt
      },
      message: `階層型検品チェックリストは現在${isEnabled ? '有効' : '無効'}です`
    });

  } catch (error) {
    console.error('[FEATURE FLAG ERROR] フィーチャーフラグ取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'フィーチャーフラグの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// フィーチャーフラグの切り替え
export async function POST(request: NextRequest) {
  try {
    console.log('[FEATURE FLAG] 階層型検品チェックリストのフィーチャーフラグ切り替え開始');
    
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled フィールドはboolean型である必要があります' },
        { status: 400 }
      );
    }

    console.log(`[FEATURE FLAG] 階層型検品チェックリストを${enabled ? '有効化' : '無効化'}中...`);

    // フラグの存在確認と更新
    const existingFlag = await prisma.systemSetting.findUnique({
      where: { key: 'hierarchical_inspection_checklist_enabled' }
    });

    let updatedFlag;
    if (existingFlag) {
      // 既存フラグを更新
      updatedFlag = await prisma.systemSetting.update({
        where: { key: 'hierarchical_inspection_checklist_enabled' },
        data: { 
          value: enabled.toString(),
          updatedAt: new Date()
        }
      });
    } else {
      // フラグを新規作成
      updatedFlag = await prisma.systemSetting.create({
        data: {
          key: 'hierarchical_inspection_checklist_enabled',
          value: enabled.toString(),
          description: '階層型検品チェックリストシステムの有効/無効を制御（true=新システム, false=既存システム）',
          type: 'boolean',
          isActive: true
        }
      });
    }

    console.log(`[FEATURE FLAG] 階層型検品チェックリスト: ${enabled ? '有効化完了' : '無効化完了'}`);

    return NextResponse.json({
      success: true,
      data: {
        enabled,
        key: updatedFlag.key,
        description: updatedFlag.description,
        lastUpdated: updatedFlag.updatedAt
      },
      message: `階層型検品チェックリストを${enabled ? '有効化' : '無効化'}しました。${enabled ? '新システム' : '既存システム'}が使用されます。`
    });

  } catch (error) {
    console.error('[FEATURE FLAG ERROR] フィーチャーフラグ切り替えエラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'フィーチャーフラグの切り替えに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
