export type AccountRole = "host" | "guest";

export interface AccountIdentity {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly role: AccountRole;
}
