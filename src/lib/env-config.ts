// Mock environment variables for development
const env = {
  VITE_SUPABASE_URL: 'https://mock.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
  VITE_APIKEY: 'mock-api-key',
  VITE_TWILIO_ACCOUNT_SID: 'mock-sid',
  VITE_TWILIO_AUTH_TOKEN: 'mock-token',
  VITE_TWILIO_FROM_NUMBER: '+14155238886',
  VITE_VERIFIED_TARGET_NUMBER: '+1234567890'
};

// Export environment variables
Object.entries(env).forEach(([key, value]) => {
  if (!import.meta.env[key]) {
    import.meta.env[key] = value;
  }
});

export default env;
