import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

process.env.NEXT_PUBLIC_API_BASE_URL ??= "http://localhost/api/v1";
process.env.NEXT_PUBLIC_MOCK_API_LATENCY_MS ??= "0";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: { provider: "v8", reporter: ["text", "html"] },
  },
});
