import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyjgvuuiqyvtuulbwlwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amd2dXVpcXl2dHV1bGJ3bHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDY2MDIsImV4cCI6MjA5MzEyMjYwMn0.OUySvbqmLCwqhsKRWDvGn3IleHAcG8gGMVyv7EUB8Ls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  console.log("Testing delete...");
  const { data, error } = await supabase
    .from('participants')
    .delete()
    .neq('client_id', 'dummy');

  console.log("Data:", data);
  console.log("Error:", error);
}

testDelete();
