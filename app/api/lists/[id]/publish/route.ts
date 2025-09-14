import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { publishList, assignSlug, isSlugAvailable } from '@/lib/models/lists';
import { logAction } from '@/lib/models/actionsLog';
import { logger } from '@/lib/logger';
import { mapListError } from '@/lib/http/map-error';
import { generateUniqueSlug } from '@/lib/slug';

interface Params { params: { id: string } }

// Simple ensureSlug generator using availability check hidden within publishList attempt (unique index)
async function defaultEnsureSlug() {
  return generateUniqueSlug(async (slug) => !(await isSlugAvailable(slug)));
}

export async function POST(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const res = await publishList(params.id, session.id, defaultEnsureSlug);
  if (!res.ok) {
    const mapped = mapListError(res.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  logger.info('list_published', { list_id: res.value.id, slug: res.value.slug });
  await logAction(res.value.id, 'publish', res.value.slug);
  return NextResponse.json({ list: res.value });
}
