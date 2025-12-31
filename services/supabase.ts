import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const SUPABASE_URL = 'https://iavdabpoeqrqtmodtzbv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AVQzkPM9tByALQ59VU9wTg_SavyFtru';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Supabase URL or Key is missing.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);