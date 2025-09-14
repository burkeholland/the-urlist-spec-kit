"use client";
import { useState, useTransition } from 'react';
import { useToast } from './ui/toaster';

import type { List, UrlEntry } from '@/lib/models/types';

interface EntryItemProps {
  list: List;
  entry: UrlEntry;
  onChange?: (id: string, patch: Partial<UrlEntry>) => void;
  onRemove?: (id: string) => void;
}

export function EntryItem({ list, entry, onChange, onRemove }: EntryItemProps) {
  const immutable = list.status !== 'draft';
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title || '');
  const [description, setDescription] = useState(entry.description || '');
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  const save = () => {
    if (immutable) return;
    const body = { title: title || null, description: description || null };
    startTransition(async () => {
      const res = await fetch(`/api/lists/${list.id}/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        push({ type: 'error', title: 'Update failed', message: data.error || 'Unable to update entry' });
        return;
      }
  const updated = await res.json(); // expected shape { entry: UrlEntry }
  onChange?.(entry.id, updated.entry as UrlEntry);
      push({ type: 'success', title: 'Updated', message: 'Entry updated.' });
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (immutable) return;
    if (!confirm('Remove this entry?')) return;
    startTransition(async () => {
      const res = await fetch(`/api/lists/${list.id}/entries/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        push({ type: 'error', title: 'Delete failed', message: data.error || 'Unable to delete entry' });
        return;
      }
      onRemove?.(entry.id);
      push({ type: 'success', title: 'Removed', message: 'Entry deleted.' });
    });
  };

  return (
    <li className="p-3 flex flex-col gap-2">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <a href={entry.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-sm">{entry.original_url}</a>
          <div className="text-[10px] text-gray-500 mt-1">fetch: {entry.fetch_status} • pos {entry.position}</div>
        </div>
        {!immutable && (
          <div className="flex gap-2 text-xs">
            {!editing && <button onClick={()=>setEditing(true)} className="px-2 py-1 border rounded">Edit</button>}
            {editing && <button disabled={isPending} onClick={save} className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50">Save</button>}
            {editing && <button disabled={isPending} onClick={()=>{setEditing(false); setTitle(entry.title||''); setDescription(entry.description||'');}} className="px-2 py-1 border rounded">Cancel</button>}
            <button disabled={isPending} onClick={handleDelete} className="px-2 py-1 border rounded text-red-600">Delete</button>
          </div>
        )}
      </div>
      {editing && !immutable && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            placeholder="Title"
            className="border rounded px-2 py-1 text-sm"
            disabled={isPending}
          />
          <textarea
            value={description}
            onChange={e=>setDescription(e.target.value)}
            placeholder="Description"
            className="border rounded px-2 py-1 text-sm min-h-[60px]"
            disabled={isPending}
          />
        </div>
      )}
      {!editing && (entry.title || entry.description) && (
        <div className="text-sm">
          {entry.title && <div className="font-medium">{entry.title}</div>}
          {entry.description && <div className="text-gray-600 whitespace-pre-wrap">{entry.description}</div>}
        </div>
      )}
    </li>
  );
}
