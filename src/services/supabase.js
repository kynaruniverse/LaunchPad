import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// 🔴 REPLACE THESE WITH YOUR SUPABASE PROJECT URL AND ANON KEY
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
