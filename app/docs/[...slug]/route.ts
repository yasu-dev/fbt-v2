import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function isInside(base: string, target: string): boolean {
  const rel = path.relative(base, target);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

export async function GET(_req: Request, context: { params: { slug?: string[] } }) {
  try {
    const docsDir = path.resolve(process.cwd(), 'docs');
    const segments = context.params.slug && context.params.slug.length > 0
      ? context.params.slug
      : ['index.html'];

    const requested = path.join(...segments);
    const fullPath = path.resolve(docsDir, requested);

    if (!isInside(docsDir, fullPath)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const content = await readFile(fullPath, 'utf-8');

    const contentType = ext === '.html'
      ? 'text/html; charset=utf-8'
      : ext === '.md'
        ? 'text/markdown; charset=utf-8'
        : 'text/plain; charset=utf-8';

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse('Not Found', { status: 404 });
  }
}


