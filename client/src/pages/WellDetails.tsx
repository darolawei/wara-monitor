import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { ArrowLeft, MapPin, Calendar, Activity, AlertTriangle, Loader2, Download } from "lucide-react";

import { MainLayout } from "@/components/layout/MainLayout";
import { WellStatusBadge } from "@/components/wells/WellStatusBadge";
import { CreateReadingDialog } from "@/components/readings/CreateReadingDialog";
import { useWell } from "@/hooks/use-wells";
import { useWellReadings } from "@/hooks/use-readings";
import { Button } from "@/components/ui/button";

export default function WellDetails() {
  const [, params] = useRoute("/wells/:id");
  const wellId = parseInt(params?.id || "0", 10);
  
  const { data: well, isLoading: isLoadingWell } = useWell(wellId);
  const { data: readings, isLoading: isLoadingReadings } = useWellReadings(wellId);

  if (isLoadingWell) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground text-lg">Loading well profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!well) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-destructive">Well Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The well you are looking for does not exist or has been removed.</p>
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Format data for chart
  const chartData = readings?.map(r => ({
    ...r,
    formattedDate: r.recordedAt ? format(new Date(r.recordedAt), "MMM dd, HH:mm") : '',
    salinityValue: Number(r.salinity)
  })).sort((a, b) => new Date(a.recordedAt!).getTime() - new Date(b.recordedAt!).getTime()) || [];

  const isDanger = well.status === 'danger';

  return (
    <MainLayout>
      <Link href="/">
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Overview
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Well Info */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isDanger ? 'bg-red-500' : well.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <WellStatusBadge status={well.status} className="px-3 py-1.5 text-sm" />
            </div>
            
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">{well.name}</h1>
            
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Location</p>
                  <p className="font-medium text-foreground">{well.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Registered</p>
                  <p className="font-medium text-foreground">
                    {well.createdAt ? format(new Date(well.createdAt), "MMMM dd, yyyy") : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Current Reading</p>
              <div className="flex items-end gap-2">
                <span className={`text-6xl font-display font-bold tracking-tighter ${isDanger ? 'text-red-500' : well.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {Number(well.currentSalinity).toFixed(2)}
                </span>
                <span className="text-xl font-medium text-muted-foreground mb-2">ppt</span>
              </div>
              
              {isDanger && (
                <div className="mt-4 bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex gap-3 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p><strong>Critical Alert:</strong> Salinity levels exceed safe limits for consumption or agriculture. Immediate assessment required.</p>
                </div>
              )}
            </div>
          </div>
          
          <CreateReadingDialog wellId={well.id} wellName={well.name} />
        </div>

        {/* Right Column: Chart & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">Salinity Trend</h2>
                  <p className="text-muted-foreground">Historical readings over time</p>
                </div>
              </div>
              {chartData.length > 0 && (
                <a
                  href={`/api/wells/${well.id}/readings/export`}
                  download
                  data-testid="link-export-csv"
                >
                  <Button variant="outline" size="sm" className="rounded-full gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </a>
              )}
            </div>

            <div className="h-[400px] w-full mt-4">
              {isLoadingReadings ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="formattedDate" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        color: 'hsl(var(--foreground))'
                      }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    {/* Safe Threshold */}
                    <ReferenceLine y={1.0} stroke="hsl(var(--safe))" strokeDasharray="5 5" label={{ position: 'top', value: 'Safe Limit (1.0)', fill: 'hsl(var(--safe))', fontSize: 12 }} />
                    {/* Danger Threshold */}
                    <ReferenceLine y={3.0} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ position: 'top', value: 'Danger Limit (3.0)', fill: 'hsl(var(--destructive))', fontSize: 12 }} />
                    
                    <Line 
                      type="monotone" 
                      dataKey="salinityValue" 
                      name="Salinity (ppt)"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
                  <Activity className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">No historical readings available.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Log a manual reading to start tracking.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* History List */}
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-display font-bold mb-6">Recent Log Entries</h3>
            
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {[...chartData].reverse().slice(0, 5).map((reading, i) => (
                  <div key={reading.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${Number(reading.salinity) > 3 ? 'bg-red-500' : Number(reading.salinity) >= 1 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-semibold text-foreground">{Number(reading.salinity).toFixed(2)} ppt</p>
                        <p className="text-xs text-muted-foreground">{reading.formattedDate}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {Number(reading.salinity) > 3 ? (
                        <span className="text-red-500">Danger</span>
                      ) : Number(reading.salinity) >= 1 ? (
                        <span className="text-amber-500">Warning</span>
                      ) : (
                        <span className="text-emerald-500">Safe</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic text-sm">History is empty.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
