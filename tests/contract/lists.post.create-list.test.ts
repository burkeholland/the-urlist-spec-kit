import { POST as createListRoute } from '@/app/api/lists/route';
import { __getTestCookies } from '../_setup/jest.setup';

describe('POST /api/lists', () => {
  test('creates a draft list and sets session cookie', async () => {
    const res = await createListRoute();
    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.list).toBeDefined();
    expect(body.list.status).toBe('draft');
    // cookie jar should now contain session cookie
    const jar = __getTestCookies();
    const cookieNames = Object.keys(jar);
    expect(cookieNames.length).toBeGreaterThan(0);
  });
});
