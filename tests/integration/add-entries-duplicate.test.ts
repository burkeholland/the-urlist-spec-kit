import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';

describe('Add entries duplicate detection (T027)', () => {
  test('second identical normalized_url sets duplicate=true', async () => {
    const c = await createList();
    const { list }: any = await c.json();
  // Use two forms differing only by case and trailing slash to rely on normalization collapsing them.
  // Provide URL without scheme & with mixed case and trailing slash
  const url = 'Example.COM/SomePath/';
    const firstRes = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url }) }), { params: { id: list.id } });
    expect(firstRes.status).toBe(201);
    const firstJson: any = await firstRes.json();
    expect(firstJson.duplicate).toBe(false);
  // Second variant uses explicit https, lowercase path, no trailing slash.
  const secondRes = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url: 'https://example.com/SomePath' }) }), { params: { id: list.id } });
    expect(secondRes.status).toBe(201);
    const secondJson: any = await secondRes.json();
    expect(secondJson.duplicate).toBe(true);
  });
});
