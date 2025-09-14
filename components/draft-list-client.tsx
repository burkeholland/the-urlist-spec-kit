"use client";
import { useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { AddEntryForm } from './add-entry-form';
import { EntryItem } from './entry-item';
import { PublishControls } from './publish-controls';
import { useToast } from './ui/toaster';

import type { List, UrlEntry } from '@/lib/models/types';

interface DraftListClientProps {
  initialList: List;
  initialEntries: UrlEntry[];
}

export default function DraftListClient({ initialList, initialEntries }: DraftListClientProps) {
  const [list, setList] = useState<List>(initialList);
  const [entries, setEntries] = useState<UrlEntry[]>(initialEntries);
  // const [isPublishing, startPublish] = useTransition(); // reserved for future async publish refetch
  const { push } = useToast();

  const onAdded = useCallback((entry: UrlEntry, duplicate: boolean) => {
    setEntries(e => [...e, entry]);
    if (duplicate) push({ type: 'info', title: 'Duplicate', message: 'URL already existed (appended anyway).' });
  }, [push]);

  const updateEntry = useCallback((id: string, patch: Partial<UrlEntry>) => {
    setEntries(list => list.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(list => list.filter(e => e.id !== id));
  }, []);

  const handlePublishComplete = useCallback((published: List) => {
    setList(published as List);
    push({ type: 'success', title: 'Published', message: `List is live at /p/${published.slug}` });
  }, [push]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Draft List</h1>
        <p className="text-sm text-gray-500">ID: {list.id}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>Status: <strong>{list.status}</strong></span>
          {list.slug && <span>Slug: {list.slug}</span>}
          {list.published_at && <span>Published: {new Date(list.published_at).toLocaleString()}</span>}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-medium">Add Entry</h2>
        {list.status === 'draft' && (
          <AddEntryForm listId={list.id} onAdded={onAdded} />
        )}
        {list.status !== 'draft' && <div className="text-sm text-gray-500">List is published; entries immutable.</div>}
      </section>

      <section>
        <h2 className="font-medium mb-2">Entries ({entries.length})</h2>
        <ul className="divide-y border rounded">
          {entries.map(e => (
            <EntryItem key={e.id} list={list} entry={e} onChange={updateEntry} onRemove={removeEntry} />
          ))}
          {entries.length === 0 && <li className="p-4 text-sm text-gray-500">No entries yet.</li>}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Publish</h2>
        <PublishControls list={list} disabled={list.status !== 'draft'} onListUpdate={setList} onPublish={handlePublishComplete} />
      </section>

      <div>
        <Link href="/" className="text-blue-600 underline text-sm">Back to home</Link>
      </div>
    </div>
  );
}
