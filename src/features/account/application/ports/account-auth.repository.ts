import type {
  AccountIdentity,
  AccountRole,
} from "../../domain/entities/account-identity";

export interface CreateAccountInput {
  readonly fullName: string;
  readonly email: string;
  readonly password: string;
  readonly role: AccountRole;
}

export interface SignInInput {
  readonly email: string;
  readonly password: string;
  readonly role: AccountRole;
}

export interface AccountAuthRepository {
  subscribe(listener: () => void): () => void;
  getCurrentAccount(): AccountIdentity | null;
  createAccount(input: CreateAccountInput): Promise<AccountIdentity>;
  signIn(input: SignInInput): Promise<AccountIdentity>;
  signOut(): void;
}

export type AccountAuthErrorCode =
  | "ACCOUNT_EXISTS"
  | "INVALID_CREDENTIALS"
  | "STORAGE_UNAVAILABLE"
  | "INVALID_INPUT";

export class AccountAuthError extends Error {
  constructor(
    readonly code: AccountAuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AccountAuthError";
  }
}
