// Placeholder for Supabase generated types.
// Run `npm run db:types` after `supabase start` to regenerate from the live schema.
// Until then we use a permissive `any` so app-level code type-checks against
// arbitrary tables. Replace with the generated types for proper safety.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = any;
