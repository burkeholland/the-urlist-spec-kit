import { POST as createListHandler } from '@/app/api/lists/route';
import { GET as getListHandler } from '@/app/api/lists/[id]/route';

describe('Draft lifecycle (T026)', () => {
  test('create -> fetch draft list with no entries', async () => {
    // Create list
    const createRes = await createListHandler();
    expect(createRes.status).toBe(201);
    const createdJson: any = await createRes.json();
    expect(createdJson.list).toBeDefined();
    expect(createdJson.list.id).toMatch(/^[a-f0-9-]{36}$/); // uuid
    expect(createdJson.list.status).toBe('draft');

    // Fetch list
    const getRes = await getListHandler(new Request('http://localhost'), { params: { id: createdJson.list.id } });
    expect(getRes.status).toBe(200);
    const getJson: any = await getRes.json();
    expect(getJson.list.id).toBe(createdJson.list.id);
    expect(getJson.entries).toEqual([]);
    // Ensure essential fields present
    expect(getJson.list).toHaveProperty('created_at');
    expect(getJson.list).toHaveProperty('updated_at');
    expect(getJson.list.deleted_at).toBeNull();
    expect(getJson.list.slug).toBeNull();
    expect(getJson.list.published_at).toBeNull();
  });
});
