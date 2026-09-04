import { Droplet, AlertOctagon, ShieldCheck, TrendingUp, Loader2, RefreshCw, MapPin, X, Brain, Siren, ClipboardCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { WellCard } from "@/components/wells/WellCard";
import { CreateWellDialog } from "@/components/wells/CreateWellDialog";
import { useWells } from "@/hooks/use-wells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WellsListResponse } from "@shared/routes";

function formatRelativeTime(date: Date | null): string {
  if (!date) return "never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function useProvinceFilter(): string | null {
  const [location] = useLocation();
  return useMemo(() => {
    const queryIndex = location.indexOf("?");
    const search = queryIndex >= 0 ? location.slice(queryIndex) : window.location.search;
    const params = new URLSearchParams(search);
    const province = params.get("province");
    return province && province.trim() !== "" ? province : null;
  }, [location]);
}

type AiInsight = {
  level: "stable" | "watch" | "urgent";
  title: string;
  summary: string;
  primaryAction: string;
  fieldChecklist: string[];
};

function buildAiInsight(wells: WellsListResponse | undefined, provinceFilter: string | null): AiInsight {
  if (!wells || wells.length === 0) {
    return {
      level: "stable",
      title: "AI Risk Advisor: awaiting sensor data",
      summary: provinceFilter
        ? `No wells are registered in ${provinceFilter}, so the advisor has no field data for this province.`
        : "Register wells or connect an ESP32 sensor to start generating water safety guidance.",
      primaryAction: "Register a well and collect the first salinity reading.",
      fieldChecklist: ["Confirm the monitoring location", "Calibrate the sensor", "Collect a baseline fresh-water reading"],
    };
  }

  const sortedByRisk = [...wells].sort((a, b) => Number(b.currentSalinity) - Number(a.currentSalinity));
  const highest = sortedByRisk[0];
  const dangerWells = wells.filter((w) => w.status === "danger");
  const warningWells = wells.filter((w) => w.status === "warning");
  const avg = wells.reduce((sum, well) => sum + Number(well.currentSalinity), 0) / wells.length;
  const affectedProvinces = Array.from(new Set(wells.filter((w) => w.status !== "safe").map((w) => w.province).filter(Boolean)));

  if (dangerWells.length > 0) {
    return {
      level: "urgent",
      title: "AI Risk Advisor: immediate field response",
      summary: `${dangerWells.length} well${dangerWells.length === 1 ? "" : "s"} exceed the danger threshold. Highest risk is ${highest.name} at ${Number(highest.currentSalinity).toFixed(2)} ppt${highest.province ? ` in ${highest.province}` : ""}.`,
      primaryAction: "Notify the community, stop drinking-water use from critical wells, and confirm readings with a second sample.",
      fieldChecklist: [
        "Retest the highest-risk well",
        "Mark unsafe water points",
        "Prepare alternative water supply",
        affectedProvinces.length > 0 ? `Prioritize ${affectedProvinces.join(", ")}` : "Prioritize affected coastal communities",
      ],
    };
  }

  if (warningWells.length > 0 || avg >= 1) {
    return {
      level: "watch",
      title: "AI Risk Advisor: saltwater intrusion watch",
      summary: `${warningWells.length} well${warningWells.length === 1 ? "" : "s"} are approaching unsafe salinity. Network average is ${avg.toFixed(2)} ppt.`,
      primaryAction: "Increase sampling frequency and check whether tides, drought, or pumping are raising salinity.",
      fieldChecklist: [
        "Collect another reading within 24 hours",
        "Compare coastal and inland wells",
        "Ask residents about taste changes",
        "Prepare an alert if readings pass 3.0 ppt",
      ],
    };
  }

  return {
    level: "stable",
    title: "AI Risk Advisor: water network stable",
    summary: `All monitored wells are currently below the warning threshold. Network average is ${avg.toFixed(2)} ppt.`,
    primaryAction: "Keep the sensors online and maintain routine monitoring.",
    fieldChecklist: ["Continue daily sampling", "Keep one manual backup reading", "Watch for sudden increases after dry weather"],
  };
}

export default function Dashboard() {
  const { data: allWells, isLoading, error, dataUpdatedAt, refetch, isFetching } = useWells();
  const [, setTick] = useState(0);
  const [, navigate] = useLocation();
  const provinceFilter = useProvinceFilter();

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const wells = useMemo(() => {
    if (!allWells) return undefined;
    if (!provinceFilter) return allWells;
    return allWells.filter((w) => w.province === provinceFilter);
  }, [allWells, provinceFilter]);

  const totalWells = wells?.length || 0;
  const dangerWells = wells?.filter((w) => w.status === "danger").length || 0;
  const warningWells = wells?.filter((w) => w.status === "warning").length || 0;
  const safeWells = wells?.filter((w) => w.status === "safe").length || 0;
  const aiInsight = buildAiInsight(wells, provinceFilter);

  const avgSalinity = totalWells > 0
    ? (wells!.reduce((sum, w) => sum + Number(w.currentSalinity), 0) / totalWells).toFixed(2)
    : "0.00";

  const clearFilter = () => navigate("/");

  return (
    <MainLayout>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground mb-3">
            {provinceFilter ? (
              <>
                <span className="text-gradient">{provinceFilter}</span> Province
              </>
            ) : (
              <>System <span className="text-gradient">Overview</span></>
            )}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {provinceFilter
              ? `Showing all monitored wells in ${provinceFilter}. Use the map to explore other provinces.`
              : "Monitoring groundwater salinity across coastal PNG to prevent saltwater intrusion and protect community water sources."}
          </p>
          <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Live</span>
            </span>
            <span>·</span>
            <span data-testid="text-last-updated">Updated {formatRelativeTime(lastUpdated)}</span>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="ml-1 p-1 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              data-testid="button-refresh"
              title="Refresh now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            {provinceFilter && (
              <Badge
                variant="secondary"
                className="ml-2 gap-1.5 cursor-pointer hover:bg-secondary/80"
                onClick={clearFilter}
                data-testid="badge-province-filter"
              >
                <MapPin className="w-3 h-3" />
                {provinceFilter}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
        <CreateWellDialog defaultProvince={provinceFilter ?? undefined} />
      </div>

      {provinceFilter && (
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={clearFilter} className="rounded-full gap-2" data-testid="button-clear-filter">
            <X className="w-3.5 h-3.5" />
            Clear filter — show all PNG wells
          </Button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Droplet className="w-16 h-16 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {provinceFilter ? `Wells in ${provinceFilter}` : "Total Monitored Wells"}
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-bold text-foreground" data-testid="stat-total-wells">{totalWells}</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden border-b-4 border-b-red-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertOctagon className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Critical (Danger)</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-bold text-red-500" data-testid="stat-danger-wells">{dangerWells}</span>
            <span className="text-sm font-medium text-muted-foreground mb-1 block">Requires action</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden border-b-4 border-b-emerald-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Safe Status</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-bold text-emerald-500" data-testid="stat-safe-wells">{safeWells}</span>
            <span className="text-sm font-medium text-muted-foreground mb-1 block">Optimal levels</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Average Salinity</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-display font-bold text-foreground" data-testid="stat-avg-salinity">{avgSalinity}</span>
            <span className="text-sm font-medium text-muted-foreground mb-1 block">ppt</span>
          </div>
        </div>
      </div>

      <div className={`glass-card rounded-2xl p-6 md:p-8 mb-12 border-l-4 ${
        aiInsight.level === "urgent"
          ? "border-l-red-500"
          : aiInsight.level === "watch"
            ? "border-l-amber-500"
            : "border-l-emerald-500"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              aiInsight.level === "urgent"
                ? "bg-red-500/10 text-red-500"
                : aiInsight.level === "watch"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-500"
            }`}>
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-2xl font-display font-bold">{aiInsight.title}</h2>
                <Badge variant={aiInsight.level === "urgent" ? "destructive" : "secondary"} className="uppercase tracking-wide">
                  {aiInsight.level}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-3xl">{aiInsight.summary}</p>
              <div className="mt-4 flex items-start gap-2 text-sm font-medium text-foreground">
                <Siren className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{aiInsight.primaryAction}</span>
              </div>
            </div>
          </div>
          <div className="lg:w-80 bg-muted/40 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Recommended Field Steps
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {aiInsight.fieldChecklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">
          {provinceFilter ? "Wells in this Province" : "Active Wells"}
        </h2>
        <div className="text-sm font-medium text-muted-foreground">
          Showing {totalWells} location{totalWells === 1 ? "" : "s"}
          {warningWells > 0 ? ` · ${warningWells} warning` : ""}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading network data...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center">
          <AlertOctagon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Failed to load well data.</p>
          <p className="text-sm opacity-80 mt-1">Please ensure the backend is connected and try again.</p>
        </div>
      ) : !wells || wells.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-3xl border border-dashed border-border text-center px-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Droplet className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {provinceFilter ? `No wells registered in ${provinceFilter} yet` : "No wells registered yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {provinceFilter
              ? "Be the first to register a community well in this province."
              : "Start monitoring coastal groundwater by registering your first community well."}
          </p>
          <CreateWellDialog defaultProvince={provinceFilter ?? undefined} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wells.map((well) => (
            <WellCard key={well.id} well={well} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
