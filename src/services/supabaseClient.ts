import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jsiucudsnqluruhmcscg.supabase.co'
const supabaseAnonKey = 'sb_publishable_KMykj7U3G9RwECONVJT0fg_jzbBN28K'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)