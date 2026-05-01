import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LaunchEvent = {
  id: number;
  target: number;
  launched: boolean;
  launched_at: string | null;
};

function getClientId() {
  const KEY = "launch_client_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function useLaunchData() {
  const [event, setEvent] = useState<LaunchEvent | null>(null);
  const [launchedCount, setLaunchedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);

  const fetchAll = async () => {
    const { data: ev } = await supabase
      .from("launch_event")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (ev) setEvent(ev as LaunchEvent);

    const { count: lc } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("launched", true);
    setLaunchedCount(lc ?? 0);

    const { count: jc } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true });
    setJoinedCount(jc ?? 0);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("launch-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => fetchAll()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "launch_event" },
        () => fetchAll()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { event, launchedCount, joinedCount, refetch: fetchAll };
}

export async function joinEvent() {
  const clientId = getClientId();
  await supabase
    .from("participants")
    .upsert({ client_id: clientId }, { onConflict: "client_id" });
  return clientId;
}

export async function pressLaunch() {
  const clientId = getClientId();
  await supabase
    .from("participants")
    .update({ launched: true, launched_at: new Date().toISOString() })
    .eq("client_id", clientId);
}

export function getMyClientId() {
  return getClientId();
}

export async function updateTarget(newTarget: number) {
  await supabase
    .from("launch_event")
    .update({ target: newTarget })
    .eq("id", 1);
}

export async function resetEvent() {
  const { error: eventError } = await supabase
    .from("launch_event")
    .update({ launched: false, launched_at: null })
    .eq("id", 1);
    
  if (eventError) console.error("Reset launch_event error:", eventError);

  const { error: partsError } = await supabase
    .from("participants")
    .delete()
    .neq("client_id", "dummy_value");
    
  if (partsError) console.error("Reset participants error:", partsError);
}