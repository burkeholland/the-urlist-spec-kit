// Placeholder URL normalization utility (T006)
// TODO (T044): Implement full normalization (protocol enforcement, lowercase host, strip tracking params, trailing slash rules)

export interface NormalizedUrl {
  original: string;
  normalized: string;
}

export function normalizeUrl(raw: string): NormalizedUrl {
  const original = raw;
  let work = raw.trim();
  if (!/^https?:\/\//i.test(work)) {
    work = 'https://' + work; // enforce https default
  }
  try {
    const u = new URL(work);
    // Force https canonical protocol
    u.protocol = 'https:';
    u.hostname = u.hostname.toLowerCase();
    // Remove default ports
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) {
      u.port = '';
    }
    // Strip common tracking params
    const tracking = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid']);
    for (const k of [...u.searchParams.keys()]) {
      if (tracking.has(k.toLowerCase())) u.searchParams.delete(k);
    }
    // Sort remaining params for deterministic canonical form
    const params = [...u.searchParams.entries()].sort((a,b)=> a[0].localeCompare(b[0]));
    u.search = params.length ? '?' + params.map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&') : '';
    // Normalize path: collapse duplicate slashes & remove trailing slash (except root)
    let path = u.pathname.replace(/\/+/g,'/');
    if (path !== '/' && path.endsWith('/')) path = path.slice(0,-1);
    u.pathname = path;
    // Drop fragment
    u.hash = '';
    return { original, normalized: u.toString() };
  } catch {
    return { original, normalized: work };
  }
}
