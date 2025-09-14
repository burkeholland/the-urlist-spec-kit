import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';
import { PATCH as patchEntry, DELETE as deleteEntry } from '@/app/api/lists/[id]/entries/[entryId]/route';
import { POST as publishList } from '@/app/api/lists/[id]/publish/route';

describe('Immutability after publish (T030)', () => {
  test('mutations rejected with 409', async () => {
    const createRes = await createList();
    const { list }: any = await createRes.json();
    // Add one entry
    const addRes = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url: 'https://example.com' }) }), { params: { id: list.id } });
    const addJson: any = await addRes.json();
    // Publish
    const pubRes = await publishList(new Request('http://localhost', { method: 'POST' }), { params: { id: list.id } });
    expect(pubRes.status).toBe(200);
    // Attempt add entry
    const addAfter = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url: 'https://example.com/after' }) }), { params: { id: list.id } });
    expect(addAfter.status).toBe(409);
    // Attempt patch existing
    const patchRes = await patchEntry(new Request('http://localhost', { method: 'PATCH', body: JSON.stringify({ title: 'New Title' }) }), { params: { id: list.id, entryId: addJson.entry.id } });
    expect(patchRes.status).toBe(409);
    // Attempt delete existing
    const delRes = await deleteEntry(new Request('http://localhost', { method: 'DELETE' }), { params: { id: list.id, entryId: addJson.entry.id } });
    expect(delRes.status).toBe(409);
  });
});
