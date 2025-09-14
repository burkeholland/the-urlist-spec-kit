import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as addEntryRoute } from '@/app/api/lists/[id]/entries/route';
import { POST as publishRoute } from '@/app/api/lists/[id]/publish/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }
async function addEntry(listId: string) {
  const req = new Request('http://localhost/api/lists/' + listId + '/entries', { method: 'POST', body: JSON.stringify({ url: 'https://publish.com/a' }) });
  await addEntryRoute(req, { params: { id: listId } });
}

describe('POST /api/lists/:id/publish', () => {
  test('publishes list when requirements met', async () => {
    const listId = await createList();
    await addEntry(listId);
    const req = new Request('http://localhost/api/lists/' + listId + '/publish', { method: 'POST' });
    const res = await publishRoute(req, { params: { id: listId } });
    const body: any = await res.json();
    expect(res.status).toBe(200);
    expect(body.list.status).toBe('published');
    expect(body.list.slug).toBeTruthy();
  });
});
