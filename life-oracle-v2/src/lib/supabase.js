import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://frexpdazuhbxecgpnbyb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZXhwZGF6dWhieGVjZ3BuYnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODEwMzEsImV4cCI6MjA5MzU1NzAzMX0.fQZo-qNALvZhwG9FXZNSItPcHP7gNcpfJTFhMt_umXk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
