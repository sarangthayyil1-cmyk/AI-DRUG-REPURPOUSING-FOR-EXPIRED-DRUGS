import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client for use in browser components.
 * Replaces createClientComponentClient with createBrowserClient from @supabase/ssr.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase environment variables are missing. Please check your .env.local file and restart your development server (Ctrl+C, then npm run dev)."
  );
}

export const supabase = createBrowserClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);
