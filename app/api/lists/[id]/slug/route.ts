import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { assignSlug } from '@/lib/models/lists';
import { mapListError } from '@/lib/http/map-error';

interface Params { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const slug: string = body.slug;
  if (!slug || typeof slug !== 'string') return NextResponse.json({ error: 'invalid_slug' }, { status: 422 });
  const res = await assignSlug(params.id, slug, session.id);
  if (!res.ok) {
    const mapped = mapListError(res.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  return NextResponse.json({ list: res.value });
}
