import { POST as createListRoute } from '@/app/api/lists/route';
import { GET as getListRoute } from '@/app/api/lists/[id]/route';

// Helper to extract created list id by calling create route then using returned JSON.
async function createDraftList() {
  const res = await createListRoute();
  const body: any = await res.json();
  return body.list.id as string;
}

describe('GET /api/lists/:id', () => {
  test('returns draft list with entries array', async () => {
    const listId = await createDraftList();
    // Simulate parameter passing to route handler
    const res = await getListRoute(new Request('http://localhost/api/lists/' + listId), { params: { id: listId } });
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.list.id).toBe(listId);
    expect(Array.isArray(body.entries)).toBe(true);
  });
});
