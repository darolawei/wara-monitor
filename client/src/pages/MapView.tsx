import { Droplets, Map as MapIcon, Info, AlertTriangle, MousePointerClick } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useWells } from "@/hooks/use-wells";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PNGMap } from "@/components/map/PNGMap";
import { PNG_PROVINCES } from "@shared/provinces";

export default function MapView() {
  const { data: wells, isLoading } = useWells();

  const provincesWithWells = wells
    ? PNG_PROVINCES.filter((p) => wells.some((w) => w.province === p))
    : [];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-foreground mb-3">
          Papua New Guinea — <span className="text-gradient">Province Map</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          All 22 PNG provinces are shown below. Provinces are coloured by the highest alert level among their registered wells.
          Click any coloured province to view its wells on the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-3xl overflow-hidden border-none shadow-xl">
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="aspect-[5/3] w-full flex items-center justify-center bg-muted/30 rounded-2xl">
                  <MapIcon className="w-12 h-12 text-muted-foreground/50 animate-pulse" />
                </div>
              ) : (
                <PNGMap wells={wells ?? []} />
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground italic px-2">
            <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Tip: Hover over any province to see well details. Provinces with no wells are shown in grey.
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Active Provinces
              </CardTitle>
              <CardDescription>
                {provincesWithWells.length} of 22 provinces have monitoring wells
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                ) : provincesWithWells.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No provinces have registered wells yet.
                  </p>
                ) : (
                  provincesWithWells.map((province) => {
                    const provinceWells = wells!.filter((w) => w.province === province);
                    const dangerCount = provinceWells.filter((w) => w.status === "danger").length;
                    const warningCount = provinceWells.filter((w) => w.status === "warning").length;
                    const dotColor =
                      dangerCount > 0
                        ? "bg-red-500"
                        : warningCount > 0
                        ? "bg-amber-500"
                        : "bg-emerald-500";
                    return (
                      <a
                        key={province}
                        href={`/?province=${encodeURIComponent(province)}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                        data-testid={`link-province-${province.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`relative flex h-2.5 w-2.5 ${dotColor} rounded-full flex-shrink-0`}>
                            {dangerCount > 0 && (
                              <span className={`absolute inline-flex h-full w-full ${dotColor} rounded-full opacity-60 animate-ping`} />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{province}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {provinceWells.length} well{provinceWells.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold ml-2 flex-shrink-0">
                          View
                        </Badge>
                      </a>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-lg bg-red-500/5 border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Climate Risk Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coastal salinity is rising at an estimated 0.2 ppt per year across PNG's low-lying provinces.
                Early detection in coastal communities like Manus, Bougainville, and the Gulf is critical for
                protecting drinking water and traditional food gardens.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-lg bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Droplets className="w-4 h-4" />
                Coverage Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-display font-bold text-primary">
                  {Math.round((provincesWithWells.length / 22) * 100)}%
                </span>
                <span className="text-xs text-muted-foreground mb-1.5">province coverage</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${(provincesWithWells.length / 22) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Pilot target: all 22 PNG provinces by end of grant cycle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
