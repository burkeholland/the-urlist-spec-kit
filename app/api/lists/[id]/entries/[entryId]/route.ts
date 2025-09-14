import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getList } from '@/lib/models/lists';
import { updateEntry, deleteEntry } from '@/lib/models/urlEntries';
import { mapEntryError, mapListError } from '@/lib/http/map-error';

interface Params { params: { id: string; entryId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  const listRes = await getList(params.id, { forCreatorSession: session?.id });
  if (!listRes.ok) {
    const mapped = mapListError(listRes.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  if (listRes.value.list.status === 'published') {
    const mapped = mapListError('immutable_after_publish');
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  const body = await req.json().catch(() => ({}));
  const upd = await updateEntry(params.id, params.entryId, { title: body.title, description: body.description });
  if (!upd.ok) {
    const mapped = mapEntryError(upd.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  return NextResponse.json({ entry: upd.value });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  const listRes = await getList(params.id, { forCreatorSession: session?.id });
  if (!listRes.ok) {
    const mapped = mapListError(listRes.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  if (listRes.value.list.status === 'published') {
    const mapped = mapListError('immutable_after_publish');
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  const del = await deleteEntry(params.id, params.entryId);
  if (!del.ok) {
    const mapped = mapEntryError(del.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  return NextResponse.json({ entry: del.value });
}
