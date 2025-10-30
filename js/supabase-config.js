// Supabase configuration
const SUPABASE_URL = 'https://foxtwymvgdocdydbvgkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHR3eW12Z2RvY2R5ZGJ2Z2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDY2NzksImV4cCI6MjA3Njc4MjY3OX0._CJdBYS3iv_xYY8dX4P8T5exYZNfoxlzbplA6YGCfds';

// Initialize Supabase client
let supabase;
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} else {
    console.error('Supabase library not loaded');
}
