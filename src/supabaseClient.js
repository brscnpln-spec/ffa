import { createClient } from '@supabase/supabase-js'

// ADIM 1.3'te kaydettiğiniz değerleri buraya yapıştırın
const supabaseUrl = 'https://bixmrtwngexqsavquzap.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeG1ydHduZ2V4cXNhdnF1emFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjAxNjQsImV4cCI6MjA3NzgzNjE2NH0.1CZd3zLW0CycAZa7-PUuRlYtTfqLniWUjXNqb-YJgpg'

export const supabase = createClient(supabaseUrl, supabaseKey)