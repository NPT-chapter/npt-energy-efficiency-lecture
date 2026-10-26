// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

function publicSupabaseEnvPlugin(): Plugin {
  return {
    name: "public-supabase-env",
    config(_, { mode }) {
      const readEnv = (prefix: string, name: string) => loadEnv(mode, process.cwd(), prefix)[name];
      const supabaseUrl =
        readEnv("SUPABASE_URL", "SUPABASE_URL") ??
        readEnv("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL") ??
        "";
      const publishableKey =
        readEnv("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY") ??
        readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
        "";
      const publicServerKeys = [
        readEnv("NEXT_PUBLIC_SUPABASE_SECRET_KEY", "NEXT_PUBLIC_SUPABASE_SECRET_KEY"),
        readEnv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"),
        readEnv("VITE_SUPABASE_SECRET_KEY", "VITE_SUPABASE_SECRET_KEY"),
        readEnv("VITE_SUPABASE_SERVICE_ROLE_KEY", "VITE_SUPABASE_SERVICE_ROLE_KEY"),
      ];

      if (publicServerKeys.some(Boolean)) {
        throw new Error("Server-only Supabase keys must not use VITE_ or NEXT_PUBLIC_ prefixes.");
      }

      return {
        define: {
          "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
          "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publishableKey),
        },
      };
    },
  };
}

export default defineConfig({
  plugins: [publicSupabaseEnvPlugin()],
  vite: { envPrefix: ["VITE_", "NEXT_PUBLIC_"] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
