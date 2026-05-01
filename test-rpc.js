import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyjgvuuiqyvtuulbwlwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amd2dXVpcXl2dHV1bGJ3bHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDY2MDIsImV4cCI6MjA5MzEyMjYwMn0.OUySvbqmLCwqhsKRWDvGn3IleHAcG8gGMVyv7EUB8Ls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log("Testing RPC...");
  const { data, error } = await supabase.rpc('reset_event');
  console.log("reset_event RPC Data:", data);
  console.log("reset_event RPC Error:", error);

  const { data: d2, error: e2 } = await supabase.rpc('reset_participants');
  console.log("reset_participants RPC Data:", d2);
  console.log("reset_participants RPC Error:", e2);
}

testRpc();
