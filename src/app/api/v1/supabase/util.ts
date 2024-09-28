const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const FUNCTION_BASE_URL = IS_PRODUCTION ? process.env.NEXT_PUBLIC_SUPABASE_URL : process.env.DEV_FUNCTION_BASE_URL
export const ANON_KEY = IS_PRODUCTION ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : process.env.DEV_SUPABASE_ANON_KEY

