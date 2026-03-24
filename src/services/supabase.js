import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// 🔴 REPLACE THESE WITH YOUR SUPABASE PROJECT URL AND ANON KEY
const SUPABASE_URL = 'https://zeecegskhirrhacxctti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZWNlZ3NraGlycmhhY3hjdHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzE1MjAsImV4cCI6MjA4OTkwNzUyMH0.dXFavd91jw6MU9yjcy43XHM-iXXUn3XCVy1RYex49cM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
