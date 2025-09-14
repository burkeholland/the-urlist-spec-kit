"use client";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/toaster';

export default function CreateListButton() {
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  const create = () => {
    if (creating) return;
    setCreating(true);
    startTransition(async () => {
      try {
        const res = await fetch('/api/lists', { method: 'POST' });
        if (!res.ok) {
          const data = await res.json().catch(()=>({}));
          push({ type: 'error', title: 'Create failed', message: data.error || 'Unable to create list' });
          setCreating(false);
          return;
        }
        const data = await res.json();
        push({ type: 'success', title: 'Draft created', message: 'Redirecting to editor...' });
        router.push(`/lists/${data.list.id}`);
      } catch (e: any) {
        push({ type: 'error', title: 'Network error', message: e.message || 'Unknown error' });
        setCreating(false);
      }
    });
  };

  return (
    <button
      onClick={create}
      disabled={isPending || creating}
      className="inline-flex items-center gap-2 rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
    >
      {creating ? 'Creating…' : 'Create New List'}
    </button>
  );
}
