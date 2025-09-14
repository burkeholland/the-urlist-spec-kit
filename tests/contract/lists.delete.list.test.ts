import { POST as createListRoute } from '@/app/api/lists/route';
import { DELETE as deleteListRoute } from '@/app/api/lists/[id]/route';
import { GET as publicGet } from '@/app/api/public/lists/[slug]/route';

async function createList() { const r = await createListRoute(); return (await r.json() as any).list.id; }

describe('DELETE /api/lists/:id', () => {
  test('soft deletes list', async () => {
    const listId = await createList();
    const req = new Request('http://localhost/api/lists/' + listId, { method: 'DELETE' });
    const res = await deleteListRoute(req, { params: { id: listId } });
    expect(res.status).toBe(200);
  });
});
