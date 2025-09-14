"use client";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface ToastItem {
  id: string;
  type?: 'info' | 'success' | 'error';
  title?: string;
  message?: string;
  timeoutMs?: number;
}

interface ToastContextValue {
  push: (t: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const timeoutMs = t.timeoutMs ?? 4000;
    setItems(list => [...list, { id, ...t, timeoutMs }]);
    if (timeoutMs) {
      setTimeout(() => setItems(list => list.filter(i => i.id !== id)), timeoutMs);
    }
  }, []);

  const remove = useCallback((id: string) => setItems(list => list.filter(i => i.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72" role="region" aria-live="polite" aria-label="Notifications">
        {items.map(t => (
          <div
            key={t.id}
            role="alert"
            className={`border rounded shadow-sm p-3 text-sm bg-white flex flex-col gap-1 ${t.type==='success'?'border-green-400':t.type==='error'?'border-red-400':'border-gray-300'}`}>            
            <div className="flex justify-between items-start gap-2">
              <div className="font-medium text-xs uppercase tracking-wide text-gray-600">{t.type || 'info'}</div>
              <button onClick={()=>remove(t.id)} className="text-gray-400 hover:text-gray-600 text-xs">×</button>
            </div>
            {t.title && <div className="font-semibold">{t.title}</div>}
            {t.message && <div className="text-gray-700 whitespace-pre-wrap leading-snug">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
