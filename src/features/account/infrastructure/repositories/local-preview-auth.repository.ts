import type {
  AccountIdentity,
  AccountRole,
} from "../../domain/entities/account-identity";
import {
  AccountAuthError,
  type AccountAuthRepository,
  type CreateAccountInput,
  type SignInInput,
} from "../../application/ports/account-auth.repository";

const STORE_KEY = "liv-dot.preview-auth.v1";
const PASSWORD_HASH_ITERATIONS = 100_000;

interface StoredAccount extends AccountIdentity {
  readonly salt: string;
  readonly passwordHash: string;
}

interface PreviewAuthStore {
  readonly version: 1;
  readonly accounts: readonly StoredAccount[];
  readonly sessionAccountId: string | null;
}

const emptyStore: PreviewAuthStore = {
  version: 1,
  accounts: [],
  sessionAccountId: null,
};

function isAccountRole(value: unknown): value is AccountRole {
  return value === "host" || value === "guest";
}

function isStoredAccount(value: unknown): value is StoredAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Record<string, unknown>;
  return (
    typeof account.id === "string" &&
    typeof account.fullName === "string" &&
    typeof account.email === "string" &&
    isAccountRole(account.role) &&
    typeof account.salt === "string" &&
    typeof account.passwordHash === "string"
  );
}

function readStore(): PreviewAuthStore {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyStore;

    const store = parsed as Record<string, unknown>;
    if (store.version !== 1 || !Array.isArray(store.accounts))
      return emptyStore;

    return {
      version: 1,
      accounts: store.accounts.filter(isStoredAccount),
      sessionAccountId:
        typeof store.sessionAccountId === "string"
          ? store.sessionAccountId
          : null,
    };
  } catch {
    throw new AccountAuthError(
      "STORAGE_UNAVAILABLE",
      "This browser cannot open local preview accounts. Check its storage settings and try again.",
    );
  }
}

function writeStore(store: PreviewAuthStore) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    throw new AccountAuthError(
      "STORAGE_UNAVAILABLE",
      "This browser could not save the preview account. Check its storage settings and try again.",
    );
  }
}

function toIdentity(account: StoredAccount): AccountIdentity {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    role: account.role,
  };
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    "",
  );
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function getWebCrypto() {
  if (!window.crypto?.subtle || !window.crypto.getRandomValues) {
    throw new AccountAuthError(
      "STORAGE_UNAVAILABLE",
      "Browser security features needed for preview sign-in are unavailable. Open LIV DOT on localhost or a secure connection and try again.",
    );
  }
  return window.crypto;
}

async function hashPassword(password: string, salt: Uint8Array) {
  const webCrypto = getWebCrypto();
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const key = await webCrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await webCrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(hash));
}

function sameHash(first: string, second: string) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateCredentials(email: string, password: string) {
  if (!email.includes("@") || password.length < 8) {
    throw new AccountAuthError(
      "INVALID_INPUT",
      "Enter a valid email address and a password with at least 8 characters.",
    );
  }
}

export class LocalPreviewAuthRepository implements AccountAuthRepository {
  private readonly listeners = new Set<() => void>();
  private snapshotSessionAccountId: string | null | undefined;
  private currentSnapshot: AccountIdentity | null = null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getCurrentAccount = () => {
    try {
      const store = readStore();
      if (this.snapshotSessionAccountId !== store.sessionAccountId) {
        const account = store.accounts.find(
          (item) => item.id === store.sessionAccountId,
        );
        this.snapshotSessionAccountId = store.sessionAccountId;
        this.currentSnapshot = account ? toIdentity(account) : null;
      }
      return this.currentSnapshot;
    } catch {
      return null;
    }
  };

  private publish() {
    this.snapshotSessionAccountId = undefined;
    this.getCurrentAccount();
    this.listeners.forEach((listener) => listener());
  }

  async createAccount(input: CreateAccountInput) {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);
    validateCredentials(email, input.password);
    if (fullName.length < 2) {
      throw new AccountAuthError(
        "INVALID_INPUT",
        "Enter your full name to create an account.",
      );
    }

    const store = readStore();
    if (store.accounts.some((account) => account.email === email)) {
      throw new AccountAuthError(
        "ACCOUNT_EXISTS",
        "An account already exists for this email in this browser. Sign in using the account type you chose when you created it.",
      );
    }

    const webCrypto = getWebCrypto();
    const salt = webCrypto.getRandomValues(new Uint8Array(16));
    const account: StoredAccount = {
      id: webCrypto.randomUUID(),
      fullName,
      email,
      role: input.role,
      salt: bytesToHex(salt),
      passwordHash: await hashPassword(input.password, salt),
    };
    const nextStore: PreviewAuthStore = {
      version: 1,
      accounts: [...store.accounts, account],
      sessionAccountId: account.id,
    };
    writeStore(nextStore);
    this.publish();
    return toIdentity(account);
  }

  async signIn(input: SignInInput) {
    const email = normalizeEmail(input.email);
    validateCredentials(email, input.password);

    const store = readStore();
    const account = store.accounts.find(
      (item) => item.email === email && item.role === input.role,
    );
    if (!account) {
      throw new AccountAuthError(
        "INVALID_CREDENTIALS",
        "That email and password do not match a local preview account. Create an account in this browser first.",
      );
    }

    const candidateHash = await hashPassword(
      input.password,
      hexToBytes(account.salt),
    );
    if (!sameHash(candidateHash, account.passwordHash)) {
      throw new AccountAuthError(
        "INVALID_CREDENTIALS",
        "That email and password do not match a local preview account. Try again or create an account in this browser.",
      );
    }

    writeStore({ ...store, sessionAccountId: account.id });
    this.publish();
    return toIdentity(account);
  }

  signOut() {
    try {
      const store = readStore();
      writeStore({ ...store, sessionAccountId: null });
    } catch {
      // The current UI session is cleared even if browser storage is unavailable.
    } finally {
      this.publish();
    }
  }
}
