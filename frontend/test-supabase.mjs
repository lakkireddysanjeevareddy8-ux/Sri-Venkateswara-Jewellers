import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tednhjipbcmlrvdvrjmh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5oamlwYmNtbHJ2ZHZyam1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NjkxNTIsImV4cCI6MjA5ODU0NTE1Mn0.2tDXDwGBcLQnUoFZLhz2cLKFWtS7zwN_Mm6exVJ6BEA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles data:", data);
  console.log("Profiles error:", error);
}

test();
