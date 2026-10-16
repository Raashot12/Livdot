"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { EventRepositoryContext } from "@/features/events/application/hooks/event-repository.context";
import { HttpEventRepository } from "@/features/events/infrastructure/repositories/http-event.repository";
import { AccountAuthProvider } from "@/features/account/application/hooks/account-auth.context";
import { LocalPreviewAuthRepository } from "@/features/account/infrastructure/repositories/local-preview-auth.repository";
import { shouldUseMockEventApi } from "@/shared/config/event-api-mode";
import { AppLoader } from "@/shared/components/feedback/app-loader";

const repository = new HttpEventRepository();
const accountAuthRepository = new LocalPreviewAuthRepository();
let mockWorkerStart: Promise<void> | null = null;

function startBrowserMocks(): Promise<void> {
  if (!mockWorkerStart) {
    mockWorkerStart = import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => undefined)
      .catch((error: unknown) => {
        mockWorkerStart = null;
        throw error;
      });
  }
  return mockWorkerStart;
}

export function Providers({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [mockReady, setMockReady] = useState(!shouldUseMockEventApi);
  const [mockError, setMockError] = useState<string | null>(null);
  useEffect(() => {
    if (!shouldUseMockEventApi) return;
    let active = true;
    void startBrowserMocks()
      .then(() => {
        if (active) setMockReady(true);
      })
      .catch((error: unknown) => {
        if (active)
          setMockError(
            error instanceof Error
              ? error.message
              : "Unknown worker startup error.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  const retryMockStartup = () => {
    setMockError(null);
    void startBrowserMocks()
      .then(() => setMockReady(true))
      .catch((error: unknown) =>
        setMockError(
          error instanceof Error
            ? error.message
            : "Unknown worker startup error.",
        ),
      );
  };
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AccountAuthProvider repository={accountAuthRepository}>
        <QueryClientProvider client={queryClient}>
          <EventRepositoryContext.Provider value={repository}>
            {mockReady ? (
              children
            ) : mockError ? (
              <main className="grid min-h-screen place-items-center p-6">
                <section className="bg-card max-w-lg rounded-xl border p-6">
                  <h1 className="font-semibold">
                    Local event service did not start
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Check that the MSW worker is available in
                    `public/mockServiceWorker.js`, then retry.
                  </p>
                  <p className="text-muted-foreground mt-3 text-xs break-words">
                    {mockError}
                  </p>
                  <button
                    className="focus-ring bg-primary text-primary-foreground mt-5 rounded-lg px-4 py-2 text-sm font-medium"
                    onClick={retryMockStartup}
                  >
                    Retry mock service
                  </button>
                </section>
              </main>
            ) : (
              <AppLoader />
            )}
            <Toaster richColors position="top-right" />
          </EventRepositoryContext.Provider>
        </QueryClientProvider>
      </AccountAuthProvider>
    </ThemeProvider>
  );
}
