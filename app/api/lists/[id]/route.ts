import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getList, softDeleteList } from '@/lib/models/lists';
import { logAction } from '@/lib/models/actionsLog';
import { logger } from '@/lib/logger';
import { mapListError } from '@/lib/http/map-error';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  // Only creator can fetch draft list; published variant will have separate public endpoint.
  const res = await getList(params.id, { includeEntries: true, forCreatorSession: session?.id });
  if (!res.ok) {
    const mapped = mapListError(res.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  return NextResponse.json({ list: res.value.list, entries: res.value.entries });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 }); // hide existence
  }
  const res = await softDeleteList(params.id, session.id);
  if (!res.ok) {
    const mapped = mapListError(res.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  logger.info('list_deleted', { list_id: res.value.id });
  await logAction(res.value.id, 'delete', res.value.slug);
  return NextResponse.json({ list: res.value });
}
