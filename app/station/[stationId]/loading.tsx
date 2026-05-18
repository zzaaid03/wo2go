export default function StationLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 animate-pulse px-4 py-6">
      <div className="mb-6 space-y-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-8 w-3/4 max-w-sm rounded-lg bg-muted" />
      </div>
      <div className="mb-4 h-28 rounded-2xl bg-muted" />
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
