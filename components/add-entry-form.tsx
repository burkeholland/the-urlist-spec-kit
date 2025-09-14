"use client";
import { useState, useTransition } from 'react';

interface AddEntryFormProps {
  listId: string;
  onAdded?: (entry: any, duplicate: boolean) => void;
}

export function AddEntryForm({ listId, onAdded }: AddEntryFormProps) {
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const thisUrl = url.trim();
    setError(null);
    setUrl("");
    startTransition(async () => {
      const res = await fetch(`/api/lists/${listId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: thisUrl })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed');
        return;
      }
      const body = await res.json();
      onAdded?.(body.entry, body.duplicate);
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
            onChange={e=>setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="flex-1 border rounded px-2 py-1 text-sm"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
        >Add</button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </form>
  );
}
