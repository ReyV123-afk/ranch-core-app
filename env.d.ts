/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SQUARE_ACCESS_TOKEN: string
  readonly VITE_SQUARE_LOCATION_ID: string
  readonly VITE_SQUARE_ENVIRONMENT: string
  readonly VITE_APP_URL: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_WEBHOOK_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 