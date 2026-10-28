import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PilgrimProfile {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  age: number;
  gender: string;
  health_conditions: string[];
  created_at?: string;
}

// Local storage key for persistent pilgrim session
const PILGRIM_STORAGE_KEY = 'smartkumbh_pilgrim_profile';

export const getStoredPilgrimProfile = (): PilgrimProfile | null => {
  try {
    const raw = localStorage.getItem(PILGRIM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredPilgrimProfile = (profile: PilgrimProfile | null) => {
  try {
    if (profile) {
      localStorage.setItem(PILGRIM_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PILGRIM_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};
