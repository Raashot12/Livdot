import type { Metadata } from "next";
import { AccountAuthPage } from "@/features/account/presentation/views/auth-pages";
import type { AccountRole } from "@/features/account/domain/entities/account-identity";

export const metadata: Metadata = {
  title: "Create account | LIV DOT",
  description: "Create a LIV DOT host or guest preview account.",
};

type CreateAccountPageProps = {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreateAccountPage({
  searchParams,
}: CreateAccountPageProps) {
  const query = await searchParams;
  const initialRole: AccountRole =
    firstValue(query.role) === "guest" ? "guest" : "host";
  const nextPath = firstValue(query.next);

  return (
    <AccountAuthPage
      mode="create-account"
      initialRole={initialRole}
      nextPath={nextPath}
    />
  );
}
