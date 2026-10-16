import Link from "next/link";

export function AccountHeader({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <header className="mb-4">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-2 text-[11px] text-[#687693]"
      >
        <Link href="/dashboard" className="text-[#075bff] hover:underline">
          Dashboard
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="font-medium text-[#253454]">
          {title}
        </span>
      </nav>
      <h1 className="text-[27px] leading-tight font-bold tracking-[-.045em] text-[#101b43] sm:text-[32px]">
        {title}
      </h1>
      <p className="mt-1 text-[12px] text-[#61708e]">{detail}</p>
    </header>
  );
}
