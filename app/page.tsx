import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6 text-sm text-zinc-200">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agnost Connect</h1>
        <Link href="/sessions" className="rounded border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">
          Open Sessions
        </Link>
      </div>
      <p className="max-w-2xl text-zinc-400">
        Lightweight interoperability and observability layer for AI agents. Ingest normalized
        framework telemetry and inspect traces.
      </p>
    </main>
  );
}
