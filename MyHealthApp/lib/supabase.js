import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yldbvevinqgqxamliuzy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGJ2ZXZpbnFncXhhbWxpdXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTY5MDMsImV4cCI6MjA2NTgzMjkwM30.SFTuxcZNAesDQwm7GExa512kqWV8oC6CK341iObxX8M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
