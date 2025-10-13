import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[DEBUG] GET /api/products/inspection/progress/001 called');
  
  // デフォルトの進捗データを返す
  const defaultProgress = {
    productId: '001',
    currentStep: 4, // 棚保管ステップ
    checklist: null,
    photos: [],
    notes: '',
    videoId: null,
    lastUpdated: new Date().toISOString(),
    status: 'inspecting'
  };
  
  return NextResponse.json(defaultProgress);
}

