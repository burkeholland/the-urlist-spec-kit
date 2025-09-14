import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as assignSlugRoute } from '@/app/api/lists/[id]/slug/route';
import { GET as slugAvailabilityRoute } from '@/app/api/slug-availability/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }

describe('POST /api/lists/:id/slug', () => {
  test('assigns custom slug when available', async () => {
    const listId = await createList();
    const slug = 'customslug123';
    const availReq = new Request('http://localhost/api/slug-availability?slug=' + slug);
    const availRes = await slugAvailabilityRoute(availReq);
    expect((await availRes.json() as any).available).toBe(true);
    const req = new Request('http://localhost/api/lists/' + listId + '/slug', { method: 'POST', body: JSON.stringify({ slug }) });
    const res = await assignSlugRoute(req, { params: { id: listId } });
    const body: any = await res.json();
    expect(res.status).toBe(200);
    expect(body.list.slug).toBe(slug);
  });
});
