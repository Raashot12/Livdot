"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  AccountIdentity,
  AccountRole,
} from "../../domain/entities/account-identity";
import type {
  AccountAuthRepository,
  CreateAccountInput,
  SignInInput,
} from "../ports/account-auth.repository";

interface AccountAuthContextValue {
  readonly account: AccountIdentity | null;
  readonly isReady: boolean;
  readonly signIn: (input: SignInInput) => Promise<AccountIdentity>;
  readonly createAccount: (
    input: CreateAccountInput,
  ) => Promise<AccountIdentity>;
  readonly signOut: () => void;
  readonly switchRole: (role: AccountRole) => void;
}

const AccountAuthContext = createContext<AccountAuthContextValue | null>(null);
const subscribeToNothing = () => () => {};
const getClientReady = () => true;
const getServerNotReady = () => false;
const getNoServerAccount = () => null;

export function AccountAuthProvider({
  repository,
  children,
}: {
  readonly repository: AccountAuthRepository;
  readonly children: ReactNode;
}) {
  const account = useSyncExternalStore(
    repository.subscribe,
    repository.getCurrentAccount,
    getNoServerAccount,
  );
  const isReady = useSyncExternalStore(
    subscribeToNothing,
    getClientReady,
    getServerNotReady,
  );

  const signIn = useCallback(
    async (input: SignInInput) => {
      const nextAccount = await repository.signIn(input);
      return nextAccount;
    },
    [repository],
  );

  const createAccount = useCallback(
    async (input: CreateAccountInput) => {
      const nextAccount = await repository.createAccount(input);
      return nextAccount;
    },
    [repository],
  );

  const signOut = useCallback(() => {
    repository.signOut();
  }, [repository]);

  const switchRole = useCallback(
    (role: AccountRole) => {
      if (account && account.role !== role) signOut();
    },
    [account, signOut],
  );

  const value = useMemo(
    () => ({ account, isReady, signIn, createAccount, signOut, switchRole }),
    [account, createAccount, isReady, signIn, signOut, switchRole],
  );

  return (
    <AccountAuthContext.Provider value={value}>
      {children}
    </AccountAuthContext.Provider>
  );
}

export function useAccountAuth() {
  const context = useContext(AccountAuthContext);
  if (!context) {
    throw new Error("useAccountAuth must be used inside AccountAuthProvider.");
  }
  return context;
}
