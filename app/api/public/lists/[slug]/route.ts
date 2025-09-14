import { NextResponse } from 'next/server';
import { getPublicListBySlug } from '@/lib/models/lists';

interface Params { params: { slug: string } }

export async function GET(_req: Request, { params }: Params) {
  const data = await getPublicListBySlug(params.slug);
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ list: data.list, entries: data.entries });
}
