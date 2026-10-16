import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/mocks/server";

process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost/api/v1";
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());
