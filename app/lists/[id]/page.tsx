import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getList } from '@/lib/models/lists';
import { getSession } from '@/lib/session';
import DraftListClient from '@/components/draft-list-client';

// Server component: Draft list management page (T049)
// Displays list metadata and entries; client components (add-entry-form, entry-item, publish-controls)
// will be progressively layered in later tasks.

interface Props { params: { id: string } }

export default async function DraftListPage({ params }: Props) {
  const session = await getSession();
  const res = await getList(params.id, { includeEntries: true, forCreatorSession: session?.id });
  if (!res.ok) return notFound();
  const { list, entries = [] } = res.value;

  return (
    <DraftListClient initialList={list as any} initialEntries={entries as any} />
  );
}
