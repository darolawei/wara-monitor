import { MapPin, Droplet, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { type WellResponse } from "@shared/routes";
import { WellStatusBadge } from "./WellStatusBadge";
import { formatDistanceToNow } from "date-fns";

interface WellCardProps {
  well: WellResponse;
}

export function WellCard({ well }: WellCardProps) {
  const isDanger = well.status === 'danger';
  const isWarning = well.status === 'warning';
  
  let borderClass = "border-border hover:border-primary/50";
  let shadowClass = "hover:shadow-lg hover:shadow-primary/5";
  
  if (isDanger) {
    borderClass = "border-red-500/30 hover:border-red-500/60";
    shadowClass = "shadow-danger/50 hover:shadow-danger";
  } else if (isWarning) {
    borderClass = "border-amber-500/30 hover:border-amber-500/60";
    shadowClass = "shadow-warning/50 hover:shadow-warning";
  }

  return (
    <Link 
      href={`/wells/${well.id}`}
      className={`
        block group relative overflow-hidden rounded-2xl p-6 transition-all duration-300
        bg-card border ${borderClass} shadow-sm ${shadowClass}
        hover:-translate-y-1
      `}
    >
      {/* Decorative gradient blob behind content */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${
        isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary'
      }`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
            {well.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {well.location}
          </div>
          {well.province && (
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full" data-testid={`badge-province-${well.id}`}>
              {well.province}
            </div>
          )}
        </div>
        <WellStatusBadge status={well.status} />
      </div>

      <div className="mt-6 flex items-end justify-between relative z-10">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
            <Droplet className="w-3.5 h-3.5 mr-1 text-primary" />
            Current Salinity
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold tracking-tight ${
              isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-foreground'
            }`}>
              {Number(well.currentSalinity).toFixed(2)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">ppt</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      
      {well.createdAt && (
        <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground relative z-10">
          Registered {formatDistanceToNow(new Date(well.createdAt))} ago
        </div>
      )}
    </Link>
  );
}
