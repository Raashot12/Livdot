export function LoadingState({
  label = "Loading",
  rows = 3,
}: {
  readonly label?: string;
  readonly rows?: number;
}) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="bg-muted h-16 animate-pulse rounded-xl" />
      ))}
    </div>
  );
}
