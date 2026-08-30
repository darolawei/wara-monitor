import { Droplets, Heart, Globe } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Droplets className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold tracking-tight">Wara-Monitor PNG</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IoT-powered groundwater salinity monitoring for coastal communities in Papua New Guinea.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Mission</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Detect saltwater intrusion early so families can protect their drinking water and farmland from rising seas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Supported By</h4>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">YECAP Climate Impact Micro Grant</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">For PNG coastal communities</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {year} Wara-Monitor PNG · Pilot deployment</span>
          <span>Status thresholds: Safe &lt; 1 ppt · Warning 1–3 ppt · Danger &gt; 3 ppt</span>
        </div>
      </div>
    </footer>
  );
}
