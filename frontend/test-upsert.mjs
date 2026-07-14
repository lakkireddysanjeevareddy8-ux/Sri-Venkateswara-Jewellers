import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tednhjipbcmlrvdvrjmh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZG5oamlwYmNtbHJ2ZHZyam1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NjkxNTIsImV4cCI6MjA5ODU0NTE1Mn0.2tDXDwGBcLQnUoFZLhz2cLKFWtS7zwN_Mm6exVJ6BEA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const profile = {
    id: 'p-1',
    username: 'Sanjeeva Reddy',
    email: 'lakkireddysanjeevareddy8@gmail.com',
    phone_number: '+919900887766',
    shipping_address: '123 Test St'
  };
  const { data, error } = await supabase.from('profiles').upsert(profile).select().maybeSingle();
  console.log("Upsert data:", data);
  console.log("Upsert error:", error);
}

test();
