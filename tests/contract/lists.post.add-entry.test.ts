import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as addEntryRoute } from '@/app/api/lists/[id]/entries/route';

async function createDraftList() {
  const res = await createListRoute();
  const body: any = await res.json();
  return body.list.id as string;
}

describe('POST /api/lists/:id/entries', () => {
  test('adds entry and returns duplicate=false', async () => {
    const listId = await createDraftList();
    const payload = { url: 'https://example.com/page' };
    const req = new Request('http://localhost/api/lists/' + listId + '/entries', { method: 'POST', body: JSON.stringify(payload) });
    const res = await addEntryRoute(req, { params: { id: listId } });
    const body: any = await res.json();
    expect(res.status).toBe(201);
    expect(body.entry).toBeDefined();
    expect(body.duplicate).toBe(false);
  });
});
