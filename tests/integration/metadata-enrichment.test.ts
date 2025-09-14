import { POST as createList } from '@/app/api/lists/route';
import { POST as postEntry } from '@/app/api/lists/[id]/entries/route';
import { GET as getList } from '@/app/api/lists/[id]/route';
import { startMetadataWorker, stopMetadataWorker } from '@/lib/workers/metadata-enricher';

describe('Metadata enrichment (T028)', () => {
  beforeAll(() => {
    startMetadataWorker({ intervalMs: 50, batchSize: 2 });
  });
  afterAll(() => {
    stopMetadataWorker();
  });

  test('pending -> success transition (placeholder success)', async () => {
    const createRes = await createList();
    const { list }: any = await createRes.json();
    const url = 'example.com/page';
    const addRes = await postEntry(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ url }) }), { params: { id: list.id } });
    expect(addRes.status).toBe(201);
    const added: any = await addRes.json();
    expect(added.entry.fetch_status).toBe('pending');
    // Poll for worker update
    const deadline = Date.now() + 5000;
    let finalStatus = added.entry.fetch_status;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 100));
      const getRes = await getList(new Request('http://localhost'), { params: { id: list.id } });
      const body: any = await getRes.json();
      const entry = body.entries.find((e: any) => e.id === added.entry.id);
      finalStatus = entry.fetch_status;
      if (finalStatus !== 'pending') break;
    }
    expect(finalStatus).toBe('success');
  });
});
