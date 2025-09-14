import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';
import { POST as assignSlug } from '@/app/api/lists/[id]/slug/route';
import { POST as publishList } from '@/app/api/lists/[id]/publish/route';
import { GET as publicGet } from '@/app/api/public/lists/[slug]/route';
import { DELETE as deleteList } from '@/app/api/lists/[id]/route';

describe('Delete list (T031)', () => {
  test('soft delete hides from public fetch', async () => {
    const createRes = await createList();
    const { list }: any = await createRes.json();
    // Entry so publish allowed
    await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url: 'https://example.com' }) }), { params: { id: list.id } });
    const slug = 'delete-me';
    await assignSlug(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ slug }) }), { params: { id: list.id } });
    await publishList(new Request('http://localhost', { method: 'POST' }), { params: { id: list.id } });
    // Public fetch ok
    const pub1 = await publicGet(new Request(`http://localhost/api/public/lists/${slug}`), { params: { slug } });
    expect(pub1.status).toBe(200);
    // Delete
    const delRes = await deleteList(new Request('http://localhost', { method: 'DELETE' }), { params: { id: list.id } });
    expect(delRes.status).toBe(200);
    // Public fetch now 404
    const pub2 = await publicGet(new Request(`http://localhost/api/public/lists/${slug}`), { params: { slug } });
    expect(pub2.status).toBe(404);
  });
});
