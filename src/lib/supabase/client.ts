import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Browser-Client fuer Supabase Auth, Storage und normale User-Queries.
export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase Umgebungsvariablen fehlen. Pruefe deine .env.local Datei.");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
