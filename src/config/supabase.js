import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wprntdahykbkhipavwta.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwcm50ZGFoeWtia2hpcGF2d3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTg0MDEsImV4cCI6MjA1MTU3NDQwMX0.RdrWr66ooMvhxefQ7hbgyGJZtOpv8qYCvxRondKKIlE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
