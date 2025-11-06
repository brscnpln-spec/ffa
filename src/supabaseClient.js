import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bixmrtwngexqsavquzap.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpeG1ydHduZ2V4cXNhdnF1emFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjAxNjQsImV4cCI6MjA3NzgzNjE2NH0.1CZd3zLW0CycAZa7-PUuRlYtTfqLniWUjXNqb-YJgpg'

export const supabase = createClient(supabaseUrl, supabaseKey)