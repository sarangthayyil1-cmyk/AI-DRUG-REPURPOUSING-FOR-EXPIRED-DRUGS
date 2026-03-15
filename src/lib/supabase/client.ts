/**
 * Supabase client placeholder.
 *
 * This will be configured in a future phase when we add:
 * - User authentication (email/password, OAuth)
 * - Session management
 * - Analysis history persistence
 * - Saved drug profiles
 *
 * Future schema:
 *
 * CREATE TABLE profiles (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id),
 *   display_name TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE analyses (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES profiles(id),
 *   drug_name TEXT NOT NULL,
 *   smiles TEXT,
 *   form_data JSONB NOT NULL,
 *   result JSONB NOT NULL,
 *   discovery_suggestions JSONB,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE saved_drugs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES profiles(id),
 *   drug_data JSONB NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 */

export function getSupabaseClient() {
  throw new Error(
    "Supabase is not yet configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}
