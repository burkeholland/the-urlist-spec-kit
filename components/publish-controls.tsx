"use client";
import { useState, useTransition, useEffect } from 'react';
import { useToast } from './ui/toaster';

import type { List } from '@/lib/models/types';

interface PublishControlsProps {
  list: List;
  disabled?: boolean;
  onListUpdate?: (list: List) => void;
  onPublish?: (list: List) => void;
}

export function PublishControls({ list, disabled, onListUpdate, onPublish }: PublishControlsProps) {
  const [slug, setSlug] = useState<string>(list.slug || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  useEffect(() => {
    if (!slug.trim()) { setAvailable(null); return; }
    const controller = new AbortController();
    setChecking(true);
    const run = async () => {
      try {
        const res = await fetch(`/api/slug-availability?slug=${encodeURIComponent(slug)}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
            setAvailable(data.available);
        } else {
          setAvailable(null);
        }
      } catch {}
      finally { setChecking(false); }
    };
    const id = setTimeout(run, 300);
    return () => { clearTimeout(id); controller.abort(); };
  }, [slug]);

  const MIN_SLUG = 3;
  const isFormatValid = !slug || /^[a-z0-9-]+$/.test(slug);
  const isLengthValid = !slug || slug.length >= MIN_SLUG;
  const isSlugValid = isFormatValid && isLengthValid;

  const assign = () => {
    if (!slug.trim() || !isSlugValid) return;
    startTransition(async () => {
      const res = await fetch(`/api/lists/${list.id}/slug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        push({ type: 'error', title: 'Slug failed', message: data.error || 'Unable to assign slug' });
        return;
      }
  const data = await res.json();
  onListUpdate?.(data.list as List);
      push({ type: 'success', title: 'Slug set', message: `Slug assigned: ${data.list.slug}` });
    });
  };

  const publish = () => {
    startTransition(async () => {
      const res = await fetch(`/api/lists/${list.id}/publish`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(()=>({}));
        push({ type: 'error', title: 'Publish failed', message: data.error || 'Unable to publish list' });
        return;
      }
  const data = await res.json();
  onPublish?.(data.list as List);
  onListUpdate?.(data.list as List);
    });
  };

  const slugStatus = () => {
    if (!slug) return null;
    if (checking) return <span className="text-xs text-gray-500">Checking…</span>;
    if (available === true) return <span className="text-xs text-green-600">Available</span>;
    if (available === false) return <span className="text-xs text-red-600">Taken</span>;
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 max-w-sm">
        <label className="text-sm font-medium">Slug (optional)</label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            disabled={!!list.slug || disabled || isPending}
            value={slug}
            onChange={e=>setSlug(e.target.value.replace(/[^a-z0-9-]/gi,'').toLowerCase())}
            placeholder="my-awesome-links"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          {!list.slug && <button disabled={disabled || isPending || !slug || available===false || !isSlugValid} onClick={assign} className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50">Set</button>}
        </div>
        {list.slug && <div className="text-xs text-gray-600">Slug locked: {list.slug}</div>}
        {!list.slug && (
          <div className="space-y-1">
            <div>{slugStatus()}</div>
            {!isLengthValid && slug && <div className="text-[11px] text-orange-600">Min length {MIN_SLUG} characters.</div>}
          </div>
        )}
      </div>
      <div>
        <button
          disabled={disabled || isPending}
          onClick={publish}
          className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50"
        >Publish</button>
      </div>
    </div>
  );
}
