import { GET as slugAvailabilityRoute } from '@/app/api/slug-availability/route';

describe('GET /api/slug-availability?slug=', () => {
  test('returns available=true when slug free', async () => {
    const req = new Request('http://localhost/api/slug-availability?slug=mytestslug');
    const res = await slugAvailabilityRoute(req);
    const body: any = await res.json();
    expect(res.status).toBe(200);
    expect(body.available).toBe(true);
  });
});
