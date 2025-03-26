/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SENDGRID_API_KEY: string;
  readonly VITE_SENDGRID_FROM_EMAIL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_SQUARE_ACCESS_TOKEN: string;
  readonly VITE_SQUARE_LOCATION_ID: string;
  readonly VITE_SQUARE_ENVIRONMENT: 'sandbox' | 'production';
  readonly VITE_STRIPE_SECRET_KEY: string;
  readonly VITE_STRIPE_WEBHOOK_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 