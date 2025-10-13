import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('[DEBUG] GET /api/products/inspection/progress/005 called');
  
  try {
    const productId = '005';
    
    console.log(`[DEBUG] Searching for progress data for product: ${productId}`);
    
    // データベースから進捗データを取得
    const progressData = await prisma.inspectionProgress.findUnique({
      where: {
        productId: productId
      }
    });
    
    if (!progressData) {
      console.log(`[INFO] No progress data found for product ${productId} - creating default`);
      
      // デフォルトの進捗データを返す
      const defaultProgress = {
        productId: productId,
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
    
    console.log(`[INFO] Progress loaded from database for product ${productId}, step ${progressData.currentStep}`);
    
    // レスポンス用にデータを整形
    const responseData = {
      productId: progressData.productId,
      currentStep: progressData.currentStep,
      checklist: progressData.checklist ? JSON.parse(progressData.checklist) : null,
      photos: progressData.photos ? JSON.parse(progressData.photos) : [],
      notes: progressData.notes || '',
      videoId: progressData.videoId,
      lastUpdated: progressData.updatedAt.toISOString(),
      status: 'inspecting'
    };
    
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('[ERROR] Progress load error:', error);
    
    // エラーの場合もデフォルトデータを返す
    const defaultProgress = {
      productId: '005',
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
}


