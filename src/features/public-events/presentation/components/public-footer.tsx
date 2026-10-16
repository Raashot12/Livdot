import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#e5ebf4] bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="LIV DOT home"
          className="focus-ring w-fit rounded-md"
        >
          <Image
            src="/images/sidebarlogo.webp"
            alt="LIV DOT"
            width={2172}
            height={724}
            className="h-auto w-[112px]"
          />
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#687693]">
          <Link
            href="/#events"
            className="focus-ring rounded hover:text-[#075bff]"
          >
            Discover events
          </Link>
          <Link
            href="/sign-in?role=host&next=%2Fdashboard"
            className="focus-ring rounded hover:text-[#075bff]"
          >
            For organizers
          </Link>
          <span>Live events, on LIV DOT.</span>
        </div>
      </div>
    </footer>
  );
}
