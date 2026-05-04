import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useLaunchData, updateTarget, resetEvent } from "@/hooks/useLaunchData";
import { CountdownDisplay } from "@/components/CountdownDisplay";
import { Trophy, Users, Zap, RotateCcw } from "lucide-react";

const Screen = () => {
  const { event, launchedCount, joinedCount } = useLaunchData();
  const [joinUrl, setJoinUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setJoinUrl("https://recspo-launch26.vercel.app/");
  }, []);

  const target = event?.target ?? 10;
  const isLaunched = event?.launched || (target > 0 && launchedCount >= target);
  const isAdmin = new URLSearchParams(window.location.search).has("admin");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = "https://res.cloudinary.com/down1eunj/video/upload/v1777906087/agcglki6cnwizw6gzxwk.mp4";

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = videoUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (isLaunched) {
      setCountdown(3);
    } else {
      setCountdown(null);
      setPlayVideo(false);
    }
  }, [isLaunched]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setPlayVideo(true);
    }
  }, [countdown]);

  const [localTarget, setLocalTarget] = useState(target);

  useEffect(() => {
    setLocalTarget(target);
  }, [target]);

  useEffect(() => {
    if (playVideo && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Autoplay error:", error);
      });
    }
  }, [playVideo]);

  if (playVideo) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover"
          onEnded={() => {
            window.location.href = "https://recspo.vercel.app";
          }}
        />
        {isAdmin && (
          <div className="absolute bottom-4 right-4 flex items-center gap-3 z-50">
            <button
              onClick={() => {
                setPlayVideo(false);
                resetEvent();
              }}
              className="p-3 rounded-full bg-background/50 text-white hover:text-white/80 transition-colors border border-white/50 backdrop-blur-sm"
              title="Reset Launch"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    );
  }

  if (isLaunched) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center grid-bg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-gold opacity-20 animate-flicker" />
        <Trophy className="w-48 h-48 text-primary animate-float mb-8 relative z-10" />
        <h1 className="font-display text-[15rem] leading-none text-gradient-gold animate-scale-in relative z-10" key={countdown}>
          {countdown !== null && countdown > 0 ? countdown : "LAUNCHED"}
        </h1>
        <p className="mt-6 text-3xl uppercase tracking-[0.4em] text-foreground/80 animate-fade-in relative z-10">
          {countdown !== null && countdown > 0 ? "Initiating launch sequence..." : "Revealing the experience…"}
        </p>

        {isAdmin && (
          <div className="absolute bottom-4 right-4 flex items-center gap-3 z-50">
            <button
              onClick={resetEvent}
              className="p-3 rounded-full bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors border border-border/50 backdrop-blur-sm"
              title="Reset Launch"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col grid-bg relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />

      {/* Header */}
      <header className="flex items-center justify-between px-12 pt-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm uppercase tracking-[0.4em] text-foreground/80">Live · On Air</span>
        </div>
        <img src="/rec_logo.png" alt="Rajalakshmi Engineering College" className="h-10 md:h-12 object-contain" />
        <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
          <Users className="w-4 h-4" /> {joinedCount} joined
        </div>
      </header>

      {/* Center stage */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 gap-10">
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-foreground uppercase">
            RECSPO SPORTS DAY 26
          </h1>
          <p className="text-sm md:text-base uppercase tracking-[0.6em] text-primary/90 mt-4">
            The Site Launches At <span className="text-gradient-gold">{target}/{target}</span>
          </p>
        </div>

        <CountdownDisplay current={launchedCount} target={target} />

        <div className="flex flex-col md:flex-row items-center gap-10 mt-6">
          <div className="bg-card border-2 border-primary/40 rounded-2xl p-6 shadow-gold">
            <QRCodeSVG
              value={joinUrl}
              size={220}
              bgColor="hsl(0 0% 7%)"
              fgColor="hsl(43 96% 56%)"
              level="H"
              marginSize={2}
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <p className="text-xs uppercase tracking-[0.4em] text-primary">Step Up</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              Scan. Tap. <br />
              <span className="text-gradient-gold">Launch With Us.</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md">
              Every tap brings the new College Sports site closer to going live — right here, right now.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-12 pb-8 flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground">
        <span>// Powered by the crowd</span>
        <span className="animate-flicker">{joinUrl.replace(/^https?:\/\//, "")}</span>
      </footer>

      <div className="absolute bottom-4 right-4 flex items-center gap-3 z-50">
        <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2 border border-border/50 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Target</span>
          <input 
            type="number" 
            value={localTarget}
            onChange={(e) => setLocalTarget(Number(e.target.value))}
            onBlur={() => updateTarget(localTarget)}
            onKeyDown={(e) => e.key === 'Enter' && updateTarget(localTarget)}
            className="w-16 bg-transparent text-foreground font-display text-lg focus:outline-none text-center"
            title="Press Enter or click away to save"
          />
        </div>
        <button
          onClick={resetEvent}
          className="p-3 rounded-full bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors border border-border/50 backdrop-blur-sm"
          title="Reset Launch"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
};

export default Screen;