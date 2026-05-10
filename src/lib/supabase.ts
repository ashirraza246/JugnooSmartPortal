import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aukoisdyezickvruhfyv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a29pc2R6ZXppY2t2cnVoZnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkyOTgsImV4cCI6MjA5Mzg0NTI5OH0.9AX6E08_radO0HUtYjbcLiW2UC9-vHhA-2BlZHrJUqI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
