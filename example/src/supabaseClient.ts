import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Get the URL and anon key from your project settings
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);