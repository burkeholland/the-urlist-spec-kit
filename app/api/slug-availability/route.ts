import { NextResponse } from 'next/server';
import { isSlugAvailable } from '@/lib/models/lists';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'missing_slug' }, { status: 400 });
  const available = await isSlugAvailable(slug);
  return NextResponse.json({ slug, available });
}
