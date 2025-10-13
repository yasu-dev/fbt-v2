import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    if (!filename) {
      return NextResponse.json({ error: 'fileName は必須です' }, { status: 400 });
    }

    const labelsDir = path.join(process.cwd(), 'public', 'labels');
    const filePath = path.join(labelsDir, filename);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = ext === '.pdf' ? 'application/pdf' :
                         ext === '.png' ? 'image/png' :
                         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream';
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
          'Cache-Control': 'private, max-age=0, must-revalidate'
        }
      });
    } catch (e) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 404 });
    }
  } catch (error) {
    console.error('[ERROR] label/download:', error);
    return NextResponse.json({ error: 'ラベルダウンロードでエラーが発生しました' }, { status: 500 });
  }
}




