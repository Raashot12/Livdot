import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
  isRetrying = false,
}: {
  readonly title?: string;
  readonly description: string;
  readonly retry?: () => void;
  readonly isRetrying?: boolean;
}) {
  return (
    <div
      className="border-destructive/30 bg-destructive/5 rounded-xl border p-5"
      role="alert"
    >
      <div className="flex gap-3">
        <AlertCircle
          className="text-destructive mt-0.5 shrink-0"
          size={20}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          {retry && (
            <button
              className="focus-ring bg-card mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
              onClick={retry}
              disabled={isRetrying}
            >
              <RefreshCw
                size={16}
                className={isRetrying ? "animate-spin" : ""}
                aria-hidden="true"
              />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
