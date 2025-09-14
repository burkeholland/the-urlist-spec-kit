import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';
import { DELETE as deleteEntry } from '@/app/api/lists/[id]/entries/[entryId]/route';
import { GET as getList } from '@/app/api/lists/[id]/route';

describe('Delete entry position stability (T032)', () => {
  test('remaining entries keep positions (no compaction requirement)', async () => {
    const createRes = await createList();
    const { list }: any = await createRes.json();
    const urls = ['https://a.com','https://b.com','https://c.com'];
    const entries: any[] = [];
    for (const u of urls) {
      const r = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url: u }) }), { params: { id: list.id } });
      const j: any = await r.json();
      entries.push(j.entry);
    }
    // Delete middle
    const mid = entries[1];
    const delRes = await deleteEntry(new Request('http://localhost', { method: 'DELETE' }), { params: { id: list.id, entryId: mid.id } });
    expect(delRes.status).toBe(200);
    // Fetch list
    const getRes = await getList(new Request('http://localhost'), { params: { id: list.id } });
    const getJson: any = await getRes.json();
    expect(getJson.entries.length).toBe(2);
    const positions = getJson.entries.map((e: any) => e.position).sort((a:number,b:number)=>a-b);
    // Expect original positions [1,3] remain; we do not re-pack
    expect(positions).toEqual([1,3]);
  });
});
