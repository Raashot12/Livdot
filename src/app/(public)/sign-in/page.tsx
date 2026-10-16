import type { Metadata } from "next";
import { AccountAuthPage } from "@/features/account/presentation/views/auth-pages";
import type { AccountRole } from "@/features/account/domain/entities/account-identity";

export const metadata: Metadata = {
  title: "Sign in | LIV DOT",
  description: "Sign in to your LIV DOT host or guest preview account.",
};

type SignInPageProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const query = await searchParams;
  const initialRole: AccountRole =
    firstValue(query.role) === "guest" ? "guest" : "host";
  const nextPath = firstValue(query.next);

  return (
    <AccountAuthPage
      mode="sign-in"
      initialRole={initialRole}
      nextPath={nextPath}
    />
  );
}
