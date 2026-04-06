import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://jsiucudsnqluruhmcscg.supabase.co'
export const supabaseAnonKey = 'sb_publishable_KMykj7U3G9RwECONVJT0fg_jzbBN28K'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)