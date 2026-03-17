// Configuración de Supabase
const SUPABASE_URL = 'https://oiufrkousvbbwiedmzyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdWZya291c3ZiYndpZWRtenlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjQwOTUsImV4cCI6MjA4OTI0MDA5NX0.ga0qwd1GEr80HAu4RoNlqRwe0ju0I5K2OHtsZImYXjs';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
