import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/Supabase'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: null, // We can add AsyncStorage later if needed for auth persistence
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})
