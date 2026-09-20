import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  Beaker,
  CheckCircle2,
  Droplet,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Wifi,
  Waves,
} from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { WellStatusBadge } from "@/components/wells/WellStatusBadge";
import { useCreateReading } from "@/hooks/use-readings";
import { useWells } from "@/hooks/use-wells";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type SimStatus = "safe" | "warning" | "danger";

function getStatus(salinity: number): SimStatus {
  if (salinity > 3) return "danger";
  if (salinity >= 1) return "warning";
  return "safe";
}

function getStatusCopy(status: SimStatus) {
  if (status === "danger") {
    return {
      label: "Danger",
      title: "Unsafe salinity detected",
      action: "Stop drinking-water use, retest, and prepare an alternative supply.",
      color: "text-red-500",
      bg: "bg-red-500",
      border: "border-red-500/40",
    };
  }

  if (status === "warning") {
    return {
      label: "Warning",
      title: "Saltwater intrusion watch",
      action: "Increase sampling frequency and compare with nearby wells.",
      color: "text-amber-500",
      bg: "bg-amber-500",
      border: "border-amber-500/40",
    };
  }

  return {
    label: "Safe",
    title: "Freshwater sample stable",
    action: "Continue routine monitoring and keep a baseline reading.",
    color: "text-emerald-500",
    bg: "bg-emerald-500",
    border: "border-emerald-500/40",
  };
}

export default function SensorSimulator() {
  const { data: wells, isLoading } = useWells();
  const createReading = useCreateReading();
  const { toast } = useToast();

  const [selectedWellId, setSelectedWellId] = useState<number | null>(null);
  const [waterMl, setWaterMl] = useState(500);
  const [saltGrams, setSaltGrams] = useState(0.25);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [linkStatus, setLinkStatus] = useState<"syncing" | "linked" | "error">("syncing");

  useEffect(() => {
    if (!selectedWellId && wells && wells.length > 0) {
      setSelectedWellId(wells[0].id);
    }
  }, [selectedWellId, wells]);

  const selectedWell = useMemo(
    () => wells?.find((well) => well.id === selectedWellId) ?? null,
    [selectedWellId, wells],
  );

  const salinity = useMemo(() => {
    const liters = waterMl / 1000;
    return Math.min(8, saltGrams / liters);
  }, [saltGrams, waterMl]);

  const status = getStatus(salinity);
  const statusCopy = getStatusCopy(status);
  const fillPercent = Math.min(92, Math.max(34, (waterMl / 750) * 86));
  const saltinessPercent = Math.min(100, (salinity / 5) * 100);
  const conductivity = salinity * 1.9;

  useEffect(() => {
    if (!selectedWellId) return;

    const syncTimer = window.setTimeout(async () => {
      setLinkStatus("syncing");
      try {
        const response = await fetch("/api/simulator/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            wellId: selectedWellId,
            waterMl,
            saltGrams,
            salinity: Number(salinity.toFixed(2)),
          }),
        });

        if (!response.ok) throw new Error("Simulator link update failed");
        setLinkStatus("linked");
      } catch (error) {
        console.error(error);
        setLinkStatus("error");
      }
    }, 250);

    return () => window.clearTimeout(syncTimer);
  }, [saltGrams, salinity, selectedWellId, waterMl]);

  const sendReading = () => {
    if (!selectedWellId) {
      toast({
        title: "Choose a well first",
        description: "The virtual sensor needs a well target before it can send data.",
        variant: "destructive",
      });
      return;
    }

    createReading.mutate(
      {
        wellId: selectedWellId,
        salinity: salinity.toFixed(2),
      },
      {
        onSuccess: () => {
          setLastSent(salinity);
          toast({
            title: "Virtual sensor reading sent",
            description: `${salinity.toFixed(2)} ppt was recorded for ${selectedWell?.name ?? "the selected well"}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Reading was not recorded",
            description: error instanceof Error ? error.message : "Try again after checking your login session.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const runDemoSequence = () => {
    if (isRunningDemo) return;
    setIsRunningDemo(true);
    setWaterMl(500);
    setSaltGrams(0.25);

    window.setTimeout(() => setSaltGrams(0.75), 900);
    window.setTimeout(() => setSaltGrams(1.35), 1800);
    window.setTimeout(() => setSaltGrams(2.1), 2700);
    window.setTimeout(() => setIsRunningDemo(false), 3400);
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-4 gap-2 rounded-full px-3 py-1">
            <FlaskConical className="h-3.5 w-3.5" />
            Virtual hardware demo
          </Badge>
          <Badge
            variant={linkStatus === "error" ? "destructive" : "secondary"}
            className="mb-4 ml-2 gap-2 rounded-full px-3 py-1"
          >
            <Wifi className="h-3.5 w-3.5" />
            ESP32 {linkStatus === "linked" ? "linked" : linkStatus === "syncing" ? "syncing" : "offline"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">
            Salt Water <span className="text-gradient">Sensor Simulator</span>
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Demonstrate the future ESP32 salinity sensor without physical hardware. Add salt to the virtual glass, watch the
            reading change, then send it into the live Wara Monitor dashboard.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/">
            <Button variant="outline" className="rounded-full">Open Dashboard</Button>
          </Link>
          {selectedWellId && (
            <Link href={`/wells/${selectedWellId}`}>
              <Button variant="outline" className="rounded-full">View Well Chart</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className={`glass-card rounded-3xl border p-6 md:p-8 ${statusCopy.border}`}>
          <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-center">
            <div className="mx-auto w-full max-w-[280px]">
              <div className="relative h-[430px] rounded-b-[3rem] rounded-t-2xl border-4 border-primary/20 bg-background/70 px-5 pb-5 pt-8 shadow-inner overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700"
                  style={{ height: `${fillPercent}%` }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(45, 212, 191, 0.35), rgba(14, 165, 233, 0.45), rgba(239, 68, 68, ${saltinessPercent / 180}))`,
                    }}
                  />
                  <div className="absolute left-0 top-0 h-8 w-full animate-pulse rounded-[50%] bg-white/35" />
                  <div className="absolute bottom-8 left-8 h-3 w-3 rounded-full bg-white/60" />
                  <div className="absolute bottom-20 right-10 h-2 w-2 rounded-full bg-white/60" />
                  <div className="absolute bottom-32 left-16 h-2.5 w-2.5 rounded-full bg-white/50" />
                </div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Badge variant={status === "danger" ? "destructive" : "secondary"}>{statusCopy.label}</Badge>
                    <Waves className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-background/80 p-4 backdrop-blur border border-border/60">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Virtual probe</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className={`text-5xl font-display font-bold ${statusCopy.color}`}>{salinity.toFixed(2)}</span>
                      <span className="mb-2 font-medium text-muted-foreground">ppt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <label htmlFor="well" className="text-sm font-semibold text-muted-foreground">Target well</label>
                  {selectedWell && <WellStatusBadge status={selectedWell.status} />}
                </div>
                <select
                  id="well"
                  value={selectedWellId ?? ""}
                  onChange={(event) => setSelectedWellId(Number(event.target.value))}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                  disabled={isLoading || !wells || wells.length === 0}
                >
                  {wells?.map((well) => (
                    <option key={well.id} value={well.id}>
                      {well.name} - {well.province ?? well.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Droplet className="h-4 w-4 text-primary" />
                    Water volume
                  </div>
                  <span className="font-display text-2xl font-bold">{waterMl} ml</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="750"
                  step="25"
                  value={waterMl}
                  onChange={(event) => setWaterMl(Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Beaker className="h-4 w-4 text-primary" />
                    Salt added
                  </div>
                  <span className="font-display text-2xl font-bold">{saltGrams.toFixed(2)} g</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={saltGrams}
                  onChange={(event) => setSaltGrams(Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setSaltGrams((value) => Math.min(3, value + 0.35))}>
                  Add pinch
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setSaltGrams((value) => Math.min(3, value + 0.9))}>
                  Pour salt water
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => { setWaterMl(500); setSaltGrams(0.2); }}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Fresh rinse
                </Button>
                <Button variant="outline" className="rounded-full" onClick={runDemoSequence} disabled={isRunningDemo}>
                  <Play className="mr-2 h-4 w-4" />
                  Demo rise
                </Button>
              </div>

              <Button
                className="w-full rounded-full py-6 text-base"
                onClick={sendReading}
                disabled={createReading.isPending || isLoading || !selectedWellId}
              >
                {createReading.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Send virtual sensor reading
              </Button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusCopy.bg}/10`}>
                {status === "danger" ? (
                  <AlertTriangle className={`h-6 w-6 ${statusCopy.color}`} />
                ) : (
                  <CheckCircle2 className={`h-6 w-6 ${statusCopy.color}`} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">{statusCopy.title}</h2>
                <p className="text-sm text-muted-foreground">Current simulator assessment</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <span className="text-sm text-muted-foreground">Salinity</span>
                <span className="font-bold">{salinity.toFixed(2)} ppt</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <span className="text-sm text-muted-foreground">Estimated conductivity</span>
                <span className="font-bold">{conductivity.toFixed(2)} mS/cm</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <span className="text-sm text-muted-foreground">Dashboard status after send</span>
                <span className={`font-bold ${statusCopy.color}`}>{statusCopy.label}</span>
              </div>
              {lastSent !== null && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                  Last sent reading: <strong>{lastSent.toFixed(2)} ppt</strong>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-xl font-display font-bold">Pitch flow</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                Start with fresh water and send a safe reading.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                Add salt or run Demo rise to simulate saltwater intrusion.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                Send the reading and open the dashboard to show the well status changing.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                Open the well chart to show the trend line and explain how real ESP32 hardware will use the secured sensor API.
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Formula used for the prototype: <strong>ppt = grams of salt / liters of water</strong>. It is designed for a
              clear hackathon demonstration, then a physical sensor can be calibrated for field accuracy later.
            </p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
