import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getList } from '@/lib/models/lists';
import { addEntry } from '@/lib/models/urlEntries';
import { mapEntryError, mapListError } from '@/lib/http/map-error';
import { normalizeUrl } from '@/lib/url-normalize';

interface Params { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
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
  const rawUrl: string = body.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return NextResponse.json({ error: 'invalid_url' }, { status: 422 });
  }
  const norm = normalizeUrl(rawUrl);
  const ins = await addEntry(params.id, norm.original, norm.normalized);
  if (!ins.ok) {
    const mapped = mapEntryError(ins.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
  return NextResponse.json({ entry: ins.value.entry, duplicate: ins.value.duplicate }, { status: 201 });
}
