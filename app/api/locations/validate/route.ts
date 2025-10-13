import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 有効な棚番号のパターン
const VALID_LOCATION_PATTERNS = [
  /^[A-Z]-\d{1,2}$/, // A-1, A-01, B-2, B-02 など
  /^[A-Z]-\d{1,2}-\d{1,2}$/, // A-1-1, A-12-34 など（実際のDB形式）
  /^STD-[A-Z]-\d{2}$/, // STD-A-01 など（標準棚）
  /^HUM-\d{2}$/, // HUM-01 など（防湿庫）
  /^TEMP-\d{2}$/, // TEMP-01 など（温度管理庫）
  /^VAULT-\d{2}$/, // VAULT-01 など（金庫室）
  /^INSP-[A-Z]$/, // INSP-A など（検品室）
  /^PHOTO$/, // PHOTO（撮影室）
  /^PACK$/, // PACK（梱包室）
];

// 事前定義された有効な棚番号リスト
const PREDEFINED_LOCATIONS = [
  // 標準棚
  'STD-A-01', 'STD-A-02', 'STD-A-03', 'STD-A-04', 'STD-A-05',
  'STD-B-01', 'STD-B-02', 'STD-B-03', 'STD-B-04', 'STD-B-05',
  'STD-C-01', 'STD-C-02', 'STD-C-03', 'STD-C-04', 'STD-C-05',
  // 防湿庫
  'HUM-01', 'HUM-02', 'HUM-03',
  // 温度管理庫
  'TEMP-01', 'TEMP-02',
  // 金庫室
  'VAULT-01', 'VAULT-02',
  // 検品室
  'INSP-A', 'INSP-B',
  // 撮影室
  'PHOTO',
  // 梱包室
  'PACK',
  // 簡易形式
  'A-01', 'A-02', 'A-03', 'A-04', 'A-05',
  'B-01', 'B-02', 'B-03', 'B-04', 'B-05',
  'C-01', 'C-02', 'C-03', 'C-04', 'C-05',
  'D-01', 'D-02', 'D-03', 'D-04', 'D-05',
];

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（デモ環境対応）
    let user = null;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
    } catch (authError) {
      console.log('Auth bypass for demo environment:', authError);
      user = { 
        id: 'demo-user', 
        role: 'staff', 
        username: 'デモスタッフ',
        email: 'demo@example.com'
      };
    }

    const body = await request.json();
    const { locationCode } = body;

    if (!locationCode) {
      return NextResponse.json(
        { 
          error: '棚番号が入力されていません',
          valid: false 
        },
        { status: 400 }
      );
    }

    // 棚番号を大文字に変換
    const normalizedCode = locationCode.toUpperCase().trim();

    // 事前定義リストでチェック
    const isValidPredefined = PREDEFINED_LOCATIONS.includes(normalizedCode);

    // パターンマッチングでチェック
    const isValidPattern = VALID_LOCATION_PATTERNS.some(pattern => 
      pattern.test(normalizedCode)
    );

    let isValid = isValidPredefined || isValidPattern;
    let locationDetails = null;

    // データベースで実際の棚番号をチェック
    try {
      const dbLocation = await prisma.location.findUnique({
        where: { code: normalizedCode }
      });

      if (dbLocation) {
        isValid = true;
        // 実際の棚の現在数をカウントして返す（容量チェックの事前検証のため）
        let currentCount = 0;
        try {
          currentCount = await prisma.product.count({
            where: { currentLocationId: dbLocation.id }
          });
        } catch (countErr) {
          console.warn('Failed to count products for location, defaulting currentCount=0', countErr);
        }

        locationDetails = {
          id: dbLocation.id,
          code: dbLocation.code,
          name: dbLocation.name,
          zone: dbLocation.zone || 'unknown',
          capacity: dbLocation.capacity || 50,
          currentCount,
          type: 'database',
          environment: 'normal',
          available: dbLocation.isActive
        };
      }
    } catch (dbError) {
      console.log('Database check failed, falling back to pattern matching:', dbError.message);
    }

    if (!isValid) {
      return NextResponse.json(
        { 
          error: '無効な棚番号です。正しい形式で入力してください（例: A-1-1, A-01, STD-A-01）',
          valid: false,
          suggestedFormat: 'A-1-1',
          availableLocations: PREDEFINED_LOCATIONS.slice(0, 10) // 最初の10個を提案
        },
        { status: 400 }
      );
    }

    // データベースにない場合は、デモ実装を使用
    if (!locationDetails) {
      locationDetails = getLocationDetails(normalizedCode);
    }

    return NextResponse.json({
      id: locationDetails.id,
      code: normalizedCode,
      name: locationDetails.name,
      zone: locationDetails.zone,
      capacity: locationDetails.capacity,
      currentCount: locationDetails.currentCount,
      success: true,
      valid: true,
      message: '有効な棚番号です'
    });

  } catch (error) {
    console.error('Location validation error:', error);
    return NextResponse.json(
      { 
        error: '棚番号の検証中にエラーが発生しました',
        valid: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 棚の詳細情報を取得する関数
function getLocationDetails(locationCode: string) {
  // 棚のタイプを判定
  let type = 'standard';
  let name = locationCode;
  let capacity = 50;
  let environment = 'normal';

  if (locationCode.startsWith('STD-')) {
    type = 'standard';
    name = `標準棚 ${locationCode}`;
    capacity = 50;
  } else if (locationCode.startsWith('HUM-')) {
    type = 'humidity_controlled';
    name = `防湿庫 ${locationCode.replace('HUM-', '')}`;
    capacity = 30;
    environment = 'humidity_controlled';
  } else if (locationCode.startsWith('TEMP-')) {
    type = 'temperature_controlled';
    name = `温度管理庫 ${locationCode.replace('TEMP-', '')}`;
    capacity = 20;
    environment = 'temperature_controlled';
  } else if (locationCode.startsWith('VAULT-')) {
    type = 'secure';
    name = `金庫室 ${locationCode.replace('VAULT-', '')}`;
    capacity = 10;
    environment = 'secure';
  } else if (locationCode.startsWith('INSP-')) {
    type = 'processing';
    name = `検品室 ${locationCode.replace('INSP-', '')}`;
    capacity = 100;
    environment = 'processing';
  } else if (locationCode === 'PHOTO') {
    type = 'processing';
    name = '撮影室';
    capacity = 50;
    environment = 'processing';
  } else if (locationCode === 'PACK') {
    type = 'processing';
    name = '梱包室';
    capacity = 200;
    environment = 'processing';
  } else if (/^[A-Z]-\d{2}$/.test(locationCode)) {
    type = 'standard';
    name = `標準棚 ${locationCode}`;
    capacity = 40;
  }

  return {
    id: `location-${locationCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, // 一意のIDを生成
    code: locationCode,
    name,
    type,
    zone: locationCode.charAt(0), // 最初の文字をゾーンとして使用
    capacity,
    currentCount: Math.floor(Math.random() * capacity * 0.7), // デモ用のランダム値
    environment,
    available: true
  };
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    let user = null;
    try {
      user = await AuthService.requireRole(request, ['staff', 'admin']);
    } catch (authError) {
      console.log('Auth bypass for demo environment:', authError);
      user = { 
        id: 'demo-user', 
        role: 'staff', 
        username: 'デモスタッフ',
        email: 'demo@example.com'
      };
    }

    // 利用可能な棚番号リストを返す
    const locations = PREDEFINED_LOCATIONS.map(code => ({
      code,
      ...getLocationDetails(code)
    }));

    return NextResponse.json({
      success: true,
      locations,
      total: locations.length,
      message: '利用可能な棚番号リストを取得しました'
    });

  } catch (error) {
    console.error('Location list fetch error:', error);
    return NextResponse.json(
      { 
        error: '棚番号リストの取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}