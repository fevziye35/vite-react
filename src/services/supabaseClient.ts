import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://jsiucudsnqluruhmcscg.supabase.co'
export const supabaseAnonKey = 'sb_publishable_KMykj7U3G9RwECONVJT0fg_jzbBN28K'
export const supabaseServiceKey = 'sb_secret_nuG5Li9f41fdU6PgbJ66aQ_LokfNI8S'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})