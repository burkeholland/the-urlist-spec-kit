import { POST as createListRoute } from '@/app/api/lists/route';
import { POST as addEntryRoute } from '@/app/api/lists/[id]/entries/route';
import { PATCH as patchEntryRoute } from '@/app/api/lists/[id]/entries/[entryId]/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }
async function addEntry(listId: string) {
  const req = new Request('http://localhost/api/lists/' + listId + '/entries', { method: 'POST', body: JSON.stringify({ url: 'https://ex.com/a' }) });
  const r = await addEntryRoute(req, { params: { id: listId } });
  return (await r.json() as any).entry.id as string;
}

describe('PATCH /api/lists/:id/entries/:entryId', () => {
  test('updates title/description when draft', async () => {
    const listId = await createList();
    const entryId = await addEntry(listId);
    const req = new Request('http://localhost/api/lists/' + listId + '/entries/' + entryId, { method: 'PATCH', body: JSON.stringify({ title: 'New', description: 'Desc' }) });
    const res = await patchEntryRoute(req, { params: { id: listId, entryId } });
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.entry.title).toBe('New');
    expect(body.entry.description).toBe('Desc');
  });
});
