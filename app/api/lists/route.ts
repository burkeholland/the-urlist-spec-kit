import { NextResponse } from 'next/server';
import { ensureSession } from '@/lib/session';
import { createList } from '@/lib/models/lists';

export async function POST() {
  const session = await ensureSession();
  const result = await createList(session.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ list: result.value }, { status: 201 });
}
