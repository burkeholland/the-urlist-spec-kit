// Placeholder slug generator (T007)
// TODO (T045): Implement robust unique slug generation with collision retry loop and configurable alphabet.

const DEFAULT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export interface SlugOptions {
  length?: number;
  alphabet?: string;
}

export function generateSlug(opts: SlugOptions = {}): string {
  const length = opts.length ?? 8;
  const alphabet = opts.alphabet ?? DEFAULT_ALPHABET;
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

// Placeholder unique attempt wrapper (collisions handled later)
export async function generateUniqueSlug(isTaken: (slug: string) => Promise<boolean>, opts: SlugOptions = {}): Promise<string> {
  const maxAttempts = 5;
  let length = opts.length ?? 8;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slug = generateSlug({ ...opts, length });
    if (!(await isTaken(slug))) return slug;
  }
  // Fallback: increase length and brute-force until free (guard with cap)
  let attempts = 0;
  length += 2;
  while (attempts < 50) {
    const slug = generateSlug({ ...opts, length });
    if (!(await isTaken(slug))) return slug;
    attempts++;
  }
  throw new Error('Unable to generate unique slug after exhaustive attempts');
}
