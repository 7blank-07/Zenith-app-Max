
const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
console.log('SUPABASE_URL:', url);
