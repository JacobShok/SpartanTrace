import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from localStorage or Vite env
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('spartantrace_supabase_url');
  const localKey = localStorage.getItem('spartantrace_supabase_key');
  
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    key.length > 20
  );

  return { url, key, isConfigured };
};

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  const configSignature = `${url}_${key}`;

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUsedConfig === configSignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedConfig = configSignature;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem('spartantrace_supabase_url', url.trim());
  else localStorage.removeItem('spartantrace_supabase_url');

  if (key) localStorage.setItem('spartantrace_supabase_key', key.trim());
  else localStorage.removeItem('spartantrace_supabase_key');

  cachedClient = null;
  lastUsedConfig = '';
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('spartantrace_supabase_url');
  localStorage.removeItem('spartantrace_supabase_key');
  cachedClient = null;
  lastUsedConfig = '';
};
