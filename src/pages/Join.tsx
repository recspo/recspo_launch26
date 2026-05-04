import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLaunchData, joinEvent, pressLaunch, getMyClientId } from "@/hooks/useLaunchData";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Zap, Trophy, Activity } from "lucide-react";

const Join = () => {
  const { event, launchedCount } = useLaunchData();
  const [hasLaunched, setHasLaunched] = useState(false);
  const [joining, setJoining] = useState(true);
  const navigate = useNavigate();

  const [shakePower, setShakePower] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    } else {
      setMotionEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!motionEnabled || hasLaunched || shakePower >= 100) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;
    
    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null) return;
      
      const now = Date.now();
      if (now - lastUpdate < 100) return;

      const x = current.x;
      const y = current.y;
      const z = current.z;

      const deltaX = Math.abs(lastX - x);
      const deltaY = Math.abs(lastY - y);
      const deltaZ = Math.abs(lastZ - z);

      if (deltaX + deltaY + deltaZ > 15) { 
        setShakePower(prev => Math.min(100, prev + 10));
        lastUpdate = now;
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [motionEnabled, hasLaunched, shakePower]);

  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setMotionEnabled(true);
          setNeedsPermission(false);
        }
      } catch (error) {
        console.error(error);
        setMotionEnabled(true);
        setNeedsPermission(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await joinEvent();
      const id = getMyClientId();
      const { data } = await supabase
        .from("participants")
        .select("launched")
        .eq("client_id", id)
        .maybeSingle();
      if (data?.launched) setHasLaunched(true);
      setJoining(false);
    })();
  }, []);

  const target = event?.target ?? 10;
  const isLaunched = event?.launched || (target > 0 && launchedCount >= target);

  useEffect(() => {
    if (isLaunched) {
      const t = setTimeout(() => {
        window.location.href = "https://recspo.vercel.app";
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isLaunched]);

  const pct = Math.min(100, (launchedCount / target) * 100);

  if (isLaunched) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center grid-bg">
        <Trophy className="w-24 h-24 text-primary animate-float mb-6" />
        <h1 className="font-display text-6xl text-gradient-gold mb-3">LAUNCHED!</h1>
        <p className="text-muted-foreground uppercase tracking-widest">Loading the experience…</p>
        <div className="mt-8 w-full max-w-xs h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold animate-shimmer" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 grid-bg relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />

      <header className="w-full pt-6 text-center animate-fade-in flex flex-col items-center">
        <img src="/rec_logo.png" alt="Rajalakshmi Engineering College" className="h-8 object-contain mb-3" />
        <p className="text-xs uppercase tracking-[0.5em] text-primary/80">The Launch</p>
        <h1 className="font-display text-3xl md:text-4xl mt-2 text-gradient-gold">RECSPO SPORTS DAY 26</h1>
      </header>

      <section className="flex flex-col items-center gap-8 w-full animate-scale-in">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Live Counter</p>
          <div className="font-display text-8xl text-gradient-gold tabular-nums" key={launchedCount}>
            <span className="animate-count-up inline-block">{launchedCount}</span>
            <span className="text-muted-foreground">/{target}</span>
          </div>
        </div>

        <div className="w-full max-w-xs h-2 bg-secondary rounded-full overflow-hidden border border-border">
          <div className="h-full bg-gradient-gold transition-all duration-500 shadow-glow" style={{ width: `${pct}%` }} />
        </div>

        {hasLaunched ? (
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/40">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm uppercase tracking-widest text-primary">You're Locked In</span>
            </div>
            <p className="text-muted-foreground text-sm">Waiting for {Math.max(0, target - launchedCount)} more…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full gap-6 mt-4">
            <div className="w-full max-w-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />
                  {shakePower < 100 ? "Shake to Power Up!" : "Ready to Launch!"}
                </span>
                <span className="text-xs text-muted-foreground font-display">{shakePower}%</span>
              </div>
              <div className="w-full h-8 bg-background rounded-full overflow-hidden border-2 border-border relative p-1 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
                    shakePower === 100 ? 'bg-gradient-gold shadow-glow' : 'bg-primary/80'
                  }`}
                  style={{ width: `${shakePower}%` }}
                >
                  {shakePower < 100 && shakePower > 0 && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <Button
              disabled={joining}
              onClick={async () => {
                if (needsPermission) {
                  await requestMotionPermission();
                }
                if (shakePower < 100) {
                  setShakePower(p => Math.min(100, p + 15));
                  return;
                }
                await pressLaunch();
                setHasLaunched(true);
              }}
              className={`relative h-44 w-44 rounded-full font-display tracking-widest shadow-gold transition-all duration-500 border-4 ${
                shakePower >= 100 
                  ? "bg-gradient-gold text-primary-foreground text-3xl hover:scale-105 active:scale-95 animate-pulse-gold border-primary-foreground/10" 
                  : "bg-secondary/50 text-foreground text-xl border-border hover:scale-105 active:scale-95 backdrop-blur-sm"
              }`}
            >
              {shakePower >= 100 ? (
                <>
                  <Rocket className="w-8 h-8 absolute top-6 text-primary-foreground animate-bounce" />
                  LAUNCH
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Activity className={`w-10 h-10 ${shakePower > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  <span className="text-sm leading-tight text-center px-4 font-sans tracking-widest">
                    {needsPermission ? "TAP TO START" : "SHAKE OR TAP"}
                  </span>
                </div>
              )}
            </Button>
          </div>
        )}
      </section>

      <footer className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground pb-4">
        Watch the big screen
      </footer>
    </main>
  );
};

export default Join;