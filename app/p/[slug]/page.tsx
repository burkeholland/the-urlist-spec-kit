import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicListBySlug } from '@/lib/models/lists';

interface Props { params: { slug: string } }

export default async function PublicListPage({ params }: Props) {
  const data = await getPublicListBySlug(params.slug);
  if (!data) return notFound();
  const { list, entries = [] } = data;
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold break-words">List: {list.slug || list.id}</h1>
        {list.published_at && <div className="text-sm text-gray-500">Published {new Date(list.published_at).toLocaleString()}</div>}
      </header>
      <section>
        <h2 className="font-medium mb-2 text-lg">Entries ({entries.length})</h2>
        <ol className="space-y-4">
          {entries.map((e: any) => (
            <li key={e.id} className="border rounded p-4 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <a href={e.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-sm">{e.original_url}</a>
                {e.title && <div className="text-base font-medium leading-snug">{e.title}</div>}
                {e.description && <div className="text-sm text-gray-700 whitespace-pre-wrap leading-snug">{e.description}</div>}
              </div>
            </li>
          ))}
          {entries.length === 0 && <li className="p-4 text-sm text-gray-500">No entries.</li>}
        </ol>
      </section>
      <div>
        <Link href="/" className="text-blue-600 underline text-sm">Back to home</Link>
      </div>
    </div>
  );
}
