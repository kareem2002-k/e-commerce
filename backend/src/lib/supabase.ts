import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use a hardcoded URL if environment variable is not available or incorrect
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwsrmjzwqorcpghblmnu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3Jtanp3cW9yY3BnaGJsbW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNjYwMjQsImV4cCI6MjAzMDc0MjAyNH0.G9yO03h_qCihtpg3P37CSuVDuGGnTYAoKSQjzNK-Z6Q';

// Ensure the URL is correctly formed with 'https://' and ends with '.co'
const correctedUrl = supabaseUrl.startsWith('https://') 
  ? supabaseUrl 
  : `https://${supabaseUrl}`;

// Make sure URL ends with '.co' if it's the Supabase domain
const finalUrl = correctedUrl.includes('.supabase.c') && !correctedUrl.includes('.supabase.co')
  ? correctedUrl.replace('.supabase.c', '.supabase.co')
  : correctedUrl;

console.log('Initializing Supabase with URL:', finalUrl);

if (!finalUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(finalUrl, supabaseKey);

export default supabase;