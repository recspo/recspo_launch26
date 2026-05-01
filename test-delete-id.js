import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyjgvuuiqyvtuulbwlwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amd2dXVpcXl2dHV1bGJ3bHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NDY2MDIsImV4cCI6MjA5MzEyMjYwMn0.OUySvbqmLCwqhsKRWDvGn3IleHAcG8gGMVyv7EUB8Ls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSelectAndDelete() {
  console.log("Fetching participants...");
  const { data: participants, error: selectError } = await supabase
    .from('participants')
    .select('client_id')
    .limit(1);

  if (selectError || !participants || participants.length === 0) {
    console.log("No participants found or error:", selectError);
    return;
  }

  const clientId = participants[0].client_id;
  console.log("Attempting to delete participant with client_id:", clientId);

  const { data, error } = await supabase
    .from('participants')
    .delete()
    .eq('client_id', clientId);

  console.log("Delete Data:", data);
  console.log("Delete Error:", error);
}

testSelectAndDelete();
