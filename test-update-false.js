import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyjgvuuiqyvtuulbwlwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amd2dXVpcXl2dHV1bGJ3bHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDY2MDIsImV4cCI6MjA5MzEyMjYwMn0.OUySvbqmLCwqhsKRWDvGn3IleHAcG8gGMVyv7EUB8Ls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateFalse() {
  console.log("Testing update to false...");
  await supabase
    .from('participants')
    .update({ launched: false })
    .neq('client_id', 'dummy');

  const { data } = await supabase.from('participants').select('launched').limit(3);
  console.log("Current launched states:", data);
}

testUpdateFalse();
