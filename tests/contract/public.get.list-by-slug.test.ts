import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as addEntryRoute } from '@/app/api/lists/[id]/entries/route';
import { POST as publishRoute } from '@/app/api/lists/[id]/publish/route';
import { GET as publicGetRoute } from '@/app/api/public/lists/[slug]/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }
async function addEntry(listId: string) {
  const req = new Request('http://localhost/api/lists/' + listId + '/entries', { method: 'POST', body: JSON.stringify({ url: 'https://public.com/a' }) });
  await addEntryRoute(req, { params: { id: listId } });
}
async function publish(listId: string) {
  const req = new Request('http://localhost/api/lists/' + listId + '/publish', { method: 'POST' });
  const r = await publishRoute(req, { params: { id: listId } });
  return (await r.json() as any).list.slug as string;
}

describe('GET /api/public/lists/:slug', () => {
  test('returns published list entries', async () => {
    const listId = await createList();
    await addEntry(listId);
    const slug = await publish(listId);
    const res = await publicGetRoute(new Request('http://localhost/api/public/lists/' + slug), { params: { slug } });
    const body: any = await res.json();
    expect(res.status).toBe(200);
    expect(body.list.slug.toLowerCase()).toBe(slug.toLowerCase());
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBe(1);
  });
});
