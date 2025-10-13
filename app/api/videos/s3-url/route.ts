import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * S3動画のSigned URLを生成
 * タイムスタンプに基づいて動画のシーク時間を計算
 */
export const POST = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { s3Path, timestamp } = await req.json();

    if (!s3Path || !timestamp) {
      return NextResponse.json(
        { error: 'S3パスとタイムスタンプが必要です' },
        { status: 400 }
      );
    }

    // スタッフのみアクセス可能
    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 動画のタイムスタンプを解析
    const videoTimestamp = new Date(timestamp);
    
    // 動画ファイルの開始時間を計算（1時間単位で録画されると仮定）
    const videoStartTime = new Date(videoTimestamp);
    videoStartTime.setMinutes(0, 0, 0); // 時間の開始に設定
    
    // シーク時間を計算（秒単位）
    const seekTime = Math.floor((videoTimestamp.getTime() - videoStartTime.getTime()) / 1000);

    // S3 Signed URLを生成（実際の実装では AWS SDK を使用）
    const signedUrl = await generateS3SignedUrl(s3Path);

    return NextResponse.json({
      signedUrl,
      seekTime,
      duration: 3600, // 1時間（3600秒）
      metadata: {
        videoStartTime: videoStartTime.toISOString(),
        recordedTimestamp: timestamp,
        s3Path
      }
    });
  } catch (error) {
    console.error('S3 URL generation error:', error);
    return NextResponse.json(
      { error: 'S3 URLの生成に失敗しました' },
      { status: 500 }
    );
  }
});

/**
 * S3 Signed URLを生成
 * 本番環境では AWS SDK を使用
 */
async function generateS3SignedUrl(s3Path: string): Promise<string> {
  // 開発環境用のモック実装
  if (process.env.NODE_ENV === 'development') {
    // 開発用の動画URL（実際の動画ファイルまたはサンプル動画）
    const mockVideoUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    ];
    
    // パスに基づいてランダムに選択
    const index = Math.abs(s3Path.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % mockVideoUrls.length;
    return mockVideoUrls[index];
  }

  // 本番環境での実装例（現在はモック実装）
  // try {
  //   const AWS = require('aws-sdk');
  //   const s3 = new AWS.S3({
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //     region: process.env.AWS_REGION
  //   });

  //   const params = {
  //     Bucket: process.env.AWS_S3_BUCKET_NAME,
  //     Key: s3Path,
  //     Expires: 3600, // 1時間有効
  //     ResponseContentType: 'video/mp4'
  //   };

  //   const signedUrl = await s3.getSignedUrlPromise('getObject', params);
  //   return signedUrl;
  // } catch (error) {
  //   console.error('AWS S3 error:', error);
  //   throw new Error('S3 Signed URL生成に失敗しました');
  // }

  // モック実装を返す
  return `https://demo-s3-bucket.s3.amazonaws.com/${s3Path}?expires=3600`;
}

/**
 * 動画ファイルの存在確認
 */
export const GET = requireAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const s3Path = searchParams.get('s3Path');

    if (!s3Path) {
      return NextResponse.json(
        { error: 'S3パスが必要です' },
        { status: 400 }
      );
    }

    if (user.role !== 'staff' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 動画ファイルの存在確認
    const exists = await checkVideoExists(s3Path);

    return NextResponse.json({
      exists,
      s3Path,
      message: exists ? '動画ファイルが存在します' : '動画ファイルが見つかりません'
    });
  } catch (error) {
    console.error('Video existence check error:', error);
    return NextResponse.json(
      { error: '動画ファイルの確認に失敗しました' },
      { status: 500 }
    );
  }
});

/**
 * 動画ファイルの存在確認
 */
async function checkVideoExists(s3Path: string): Promise<boolean> {
  // 開発環境では常にtrueを返す
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // AWS SDKのモック実装
  // try {
  //   const AWS = require('aws-sdk');
  //   const s3 = new AWS.S3({
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //     region: process.env.AWS_REGION
  //   });

  //   await s3.headObject({
  //     Bucket: process.env.AWS_S3_BUCKET_NAME,
  //     Key: s3Path
  //   }).promise();

  //   return true;
  // } catch (error) {
  //   console.error('S3 head object error:', error);
  //   return false;
  // }

  // モック実装: 常にtrueを返す
  return true;
} 