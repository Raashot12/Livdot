import { AudioLines } from "lucide-react";

export function PublicEventArtwork({
  title,
  compact = false,
}: {
  readonly title: string;
  readonly compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`${title}. Event artwork has not been provided.`}
      className={`relative isolate flex overflow-hidden rounded-[14px] bg-[#071a38] text-white ${compact ? "min-h-[126px] items-end p-4" : "min-h-[240px] items-end p-6 sm:min-h-[300px] sm:p-8"}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_34%,rgba(0,140,255,.54),transparent_37%),radial-gradient(ellipse_at_22%_84%,rgba(0,214,223,.27),transparent_36%),linear-gradient(120deg,#06142f_6%,#0a2550_55%,#071a38)]"
      />
      <span
        aria-hidden="true"
        className="absolute -top-20 -right-14 -z-10 size-64 rounded-full border border-white/10 sm:size-80"
      />
      <span
        aria-hidden="true"
        className="absolute -top-8 -right-2 -z-10 size-44 rounded-full border border-white/10 sm:size-60"
      />
      <div className="flex min-w-0 items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white/80 uppercase">
            <AudioLines size={13} aria-hidden="true" />
            Event artwork not added
          </span>
          <p
            className={`max-w-[18ch] leading-[1.04] font-semibold tracking-[-0.035em] ${compact ? "text-xl" : "text-3xl sm:text-5xl"}`}
          >
            {title}
          </p>
        </div>
        <AudioLines
          aria-hidden="true"
          className="mb-1 shrink-0 text-[#00d6df]"
          size={compact ? 25 : 38}
          strokeWidth={1.6}
        />
      </div>
    </div>
  );
}
