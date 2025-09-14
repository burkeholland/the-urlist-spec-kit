import CreateListButton from '@/components/create-list-button';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 space-y-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold">The Urlist</h1>
        <p className="text-gray-600 text-sm leading-relaxed">Create a draft list of URLs, enrich metadata automatically, then publish it under a shareable slug.</p>
        <CreateListButton />
      </header>
      <section className="text-sm text-gray-500">
        <p>This is a minimal prototype UI. After creating a list you can add entries, set a slug, and publish.</p>
      </section>
    </div>
  );
}
