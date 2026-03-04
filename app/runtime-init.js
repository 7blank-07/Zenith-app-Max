'use client';

import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://ugszalubwvartwalsejx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3phbHVid3ZhcnR3YWxzZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTg4MzksImV4cCI6MjA3NDIzNDgzOX0.wHH6DctC6mtNcqZ4VeCdlPHk_Tg9xbfrY90EAUKvI8k';

let globalsInitialized = false;

export function ensureLegacyRuntimeGlobals() {
  if (globalsInitialized || typeof window === 'undefined') return;

  window.Chart = window.Chart || Chart;
  window.html2canvas = window.html2canvas || html2canvas;
  window.supabase = window.supabase || { createClient };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  window.ENV = {
    ...(window.ENV || {}),
    SUPABASE_URL: window.ENV?.SUPABASE_URL || supabaseUrl,
    SUPABASE_ANON_KEY: window.ENV?.SUPABASE_ANON_KEY || supabaseAnonKey
  };

  if (!window.supabaseClient && window.ENV.SUPABASE_URL && window.ENV.SUPABASE_ANON_KEY) {
    window.supabaseClient = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
  }

  globalsInitialized = true;
}
