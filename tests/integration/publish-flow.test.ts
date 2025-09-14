import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';
import { POST as assignSlug } from '@/app/api/lists/[id]/slug/route';
import { POST as publishList } from '@/app/api/lists/[id]/publish/route';
import { GET as publicGet } from '@/app/api/public/lists/[slug]/route';

describe('Publish flow (T029)', () => {
  test('assign custom slug then publish and fetch publicly', async () => {
    const createRes = await createList();
    const { list }: any = await createRes.json();
    // Need at least one entry before publish
    const url = 'https://example.com';
    const addRes = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url }) }), { params: { id: list.id } });
    expect(addRes.status).toBe(201);

  const custom = `my-custom-slug-${Math.random().toString(36).slice(2,8)}`;
    const slugRes = await assignSlug(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ slug: custom }) }), { params: { id: list.id } });
    expect(slugRes.status).toBe(200);
    const slugJson: any = await slugRes.json();
    expect(slugJson.list.slug).toBe(custom);

    const pubRes = await publishList(new Request('http://localhost', { method: 'POST' }), { params: { id: list.id } });
    expect(pubRes.status).toBe(200);
    const pubJson: any = await pubRes.json();
    expect(pubJson.list.status).toBe('published');
    expect(pubJson.list.published_at).not.toBeNull();

    const publicRes = await publicGet(new Request(`http://localhost/api/public/lists/${custom}`), { params: { slug: custom } });
    expect(publicRes.status).toBe(200);
    const publicJson: any = await publicRes.json();
    expect(publicJson.list.id).toBe(list.id);
  });
});
