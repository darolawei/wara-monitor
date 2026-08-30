import { AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WellStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function WellStatusBadge({ status, className, showIcon = true }: WellStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  let config = {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Safe"
  };

  if (normalizedStatus === 'warning') {
    config = {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-500",
      border: "border-amber-500/20",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: "Warning"
    };
  } else if (normalizedStatus === 'danger') {
    config = {
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-500",
      border: "border-red-500/20",
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
      label: "Danger"
    };
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.bg, config.text, config.border, className
    )}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </div>
  );
}
