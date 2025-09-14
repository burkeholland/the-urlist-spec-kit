import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as addEntryRoute } from '@/app/api/lists/[id]/entries/route';
import { DELETE as deleteEntryRoute } from '@/app/api/lists/[id]/entries/[entryId]/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }
async function addEntry(listId: string, url: string) {
  const req = new Request('http://localhost/api/lists/' + listId + '/entries', { method: 'POST', body: JSON.stringify({ url }) });
  const r = await addEntryRoute(req, { params: { id: listId } });
  return (await r.json() as any).entry.id as string;
}

describe('DELETE /api/lists/:id/entries/:entryId', () => {
  test('removes entry', async () => {
    const listId = await createList();
    const eid = await addEntry(listId, 'https://a.com');
    const req = new Request('http://localhost/api/lists/' + listId + '/entries/' + eid, { method: 'DELETE' });
    const res = await deleteEntryRoute(req, { params: { id: listId, entryId: eid } });
    expect(res.status).toBe(200);
  });
});
