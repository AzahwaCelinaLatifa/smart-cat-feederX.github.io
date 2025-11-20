import { useEffect, useMemo, useState } from "react";
import { Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

type ApiHistory = {
  id: string;
  user_id: string;
  feeding_time: string; // ISO
  portion: number;
  method: 'manual' | 'automatic';
};

type RangeType = "daily" | "weekly" | "monthly" | "yearly";

type AggregatedPoint = {
  key: string;
  label: string;
  totalAmount: number; // sum of amounts
  fedCount: number;
  skippedCount: number;
  failedCount: number;
  avgAmount: number; // avg per fed
};

export default function History() {
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [view, setView] = useState<"list" | "analytics">("list");
  const [range, setRange] = useState<RangeType>("daily");

  const [history, setHistory] = useState<ApiHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { getHistory } = await import("@/services/api");
        const data = await getHistory();
        setHistory(data);
      } catch (e) {
        // optional toast could be added
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    setShowClearDialog(false);
    toast({
      title: "History cleared",
      description: "All feeding history has been removed",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Fed":
        return <CheckCircle className="h-4 w-4" />;
      case "Skipped":
        return <AlertCircle className="h-4 w-4" />;
      case "Failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Fed":
        return "default";
      case "Skipped":
        return "secondary";
      case "Failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Helpers to aggregate history into chart points depending on selected range
  const aggregate = (entries: ApiHistory[], rangeType: RangeType): AggregatedPoint[] => {
    const now = new Date();
    const points = new Map<string, AggregatedPoint>();

    const addToPoint = (key: string, label: string, e: ApiHistory) => {
      const existing = points.get(key) ?? {
        key,
        label,
        totalAmount: 0,
        fedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        avgAmount: 0,
      };

      // Map API rows to status buckets; we only know method & portion
      // Treat method 'manual'/'automatic' as Fed events
      existing.fedCount += 1;
      existing.totalAmount += e.portion ?? 0;

      points.set(key, existing);
    };

    const makeKey = (d: Date) => {
      if (rangeType === "daily") return d.toISOString().slice(0, 10); // YYYY-MM-DD
      if (rangeType === "weekly") {
        const dt = new Date(d);
        const day = dt.getDay();
        const diff = (day + 6) % 7; // days since monday
        dt.setDate(dt.getDate() - diff);
        return dt.toISOString().slice(0, 10);
      }
      if (rangeType === "monthly") return `${d.getFullYear()}-${d.getMonth() + 1}`;
      return `${d.getFullYear()}`; // yearly
    };

    const makeLabel = (key: string) => {
      if (rangeType === "daily") return new Date(key).toLocaleDateString();
      if (rangeType === "weekly") return new Date(key).toLocaleDateString();
      if (rangeType === "monthly") {
        const [y, m] = key.split("-");
        const date = new Date(Number(y), Number(m) - 1, 1);
        return date.toLocaleString(undefined, { month: "short", year: "numeric" });
      }
      return key;
    };

    const windowMs =
      rangeType === "daily" || rangeType === "weekly"
        ? 90 * 24 * 60 * 60 * 1000
        : rangeType === "monthly"
        ? 2 * 365 * 24 * 60 * 60 * 1000
        : 6 * 365 * 24 * 60 * 60 * 1000;

    for (const e of entries) {
      const when = new Date(e.feeding_time);
      if (now.getTime() - when.getTime() > windowMs) continue;
      const key = makeKey(when);
      addToPoint(key, makeLabel(key), e);
    }

    const arr = Array.from(points.values()).sort((a, b) => (a.key > b.key ? 1 : -1));
    for (const p of arr) p.avgAmount = p.fedCount > 0 ? Math.round(p.totalAmount / p.fedCount) : 0;

    return arr;
  };

  const chartData = useMemo(() => aggregate(history, range), [history, range]);

  // Average grams per selected range (e.g. per day / per week / per month / per year)
  const avgPerPeriod = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    const total = chartData.reduce((s, p) => s + (p.totalAmount || 0), 0);
    return Math.round(total / chartData.length);
  }, [chartData]);

  // Compute a responsive bar size so bars are not too small or too large
  const barSize = useMemo(() => {
    const len = Math.max(1, chartData.length);
    // heuristic: larger datasets -> smaller bars, clamp between 14 and 36
    // fewer points => larger bars; more points => smaller bars
    const size = Math.round(Math.max(14, Math.min(36, 800 / Math.max(len, 4))));
    return size;
  }, [chartData]);

  // track which bar is hovered to apply a localized shadow
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="space-y-6" style={{marginTop: '-20px', paddingTop: '0', height: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
      <div className="flex items-center justify-between" style={{marginTop: '0', paddingTop: '0'}}>
        <div style={{marginTop: '0', paddingTop: '0'}}>
          <h1 
            className="text-3xl font-bold mb-6"
            style={{
              color: '#174143',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.84px',
              marginTop: '0'
            }}
          >
            Feeding History
          </h1>
          <p 
            className="text-muted-foreground"
            style={{
              color: '#174143',
              fontFamily: 'Montserrat',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.42px',
              marginTop: '-10px'
            }}
          >
            View past feeding records
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => setShowClearDialog(true)}
            disabled={history.length === 0}
            data-testid="button-clear-history"
          >
            <img 
              src="/assets/uil_trash.svg"
              alt="Delete"
              className="h-4 w-4 mr-2"
              style={{
                objectFit: 'contain',
                filter: 'none'
              }}
            />
            Clear History
          </Button>
        </div>
      </div>

      {/* Prominent segmented toggle at top of page */}
      <div className="mt-6 flex justify-center">
        <div
          role="tablist"
          aria-label="History view"
          className="inline-flex items-center rounded-full p-1"
          style={{
            background: 'linear-gradient(91deg, rgba(63, 184, 147, 0.40) 42.37%, rgba(0, 73, 51, 0.67) 88.48%)',
            borderRadius: '30px'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            data-testid="menu-view-history"
            className="px-6 py-2 transition-colors"
            style={{
              borderRadius: '30px',
              background: view === "list" 
                ? 'linear-gradient(0deg, #174143 0%, #174143 100%)'
                : 'transparent',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Montserrat',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.42px',
              border: 'none',
              WebkitTextFillColor: 'white',
              opacity: 1
            }}
          >
            History
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "analytics"}
            onClick={() => setView("analytics")}
            data-testid="menu-view-analytics"
            className="px-6 py-2 transition-colors"
            style={{
              borderRadius: '30px',
              background: view === "analytics" 
                ? 'linear-gradient(0deg, #174143 0%, #174143 100%)'
                : 'transparent',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Montserrat',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.42px',
              border: 'none',
              WebkitTextFillColor: 'white',
              opacity: 1
            }}
          >
            Analytics
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No feeding history available</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {view === "list" ? (
            <div className="space-y-3">
              {history.map((row, index) => {
                const when = new Date(row.feeding_time);
                return (
                  <Card key={row.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mt-2" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground" data-testid={`text-history-time-${row.id}`}>
                            {when.toLocaleTimeString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {when.toLocaleDateString()} • Portion {row.portion} • {row.method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="flex items-center gap-1" data-testid={`badge-status-${row.id}`}>
                          <CheckCircle className="h-4 w-4" />
                          Fed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              {/* add top padding so the range toggle isn't cramped against the card edge */}
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  {/* Range selector rendered as a segmented toggle to match the page style */}
                  <div role="tablist" aria-label="Range selector" className="inline-flex items-center rounded-full bg-muted p-1 shadow-sm">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={range === "daily"}
                      onClick={() => setRange("daily")}
                      data-testid="menu-range-daily"
                      className={
                        "px-3 py-1 rounded-full text-sm transition-colors " +
                        (range === "daily" ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-transparent")
                      }
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={range === "weekly"}
                      onClick={() => setRange("weekly")}
                      data-testid="menu-range-weekly"
                      className={
                        "px-3 py-1 rounded-full text-sm transition-colors " +
                        (range === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-transparent")
                      }
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={range === "monthly"}
                      onClick={() => setRange("monthly")}
                      data-testid="menu-range-monthly"
                      className={
                        "px-3 py-1 rounded-full text-sm transition-colors " +
                        (range === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-transparent")
                      }
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={range === "yearly"}
                      onClick={() => setRange("yearly")}
                      data-testid="menu-range-yearly"
                      className={
                        "px-3 py-1 rounded-full text-sm transition-colors " +
                        (range === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-transparent")
                      }
                    >
                      Yearly
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average: {avgPerPeriod} g / {range === "daily" ? "day" : range === "weekly" ? "week" : range === "monthly" ? "month" : "year"}
                  </div>
                </div>

                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} barCategoryGap="6%" margin={{ left: 4, right: 4 }}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <ReTooltip
                        formatter={(value: any, name: any, props: any) => {
                          // value is totalAmount
                          return [`${value} g`, "Total amount"];
                        }}
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const p = payload[0].payload as AggregatedPoint;
                          return (
                            <div className="bg-white p-2 rounded shadow">
                              <div className="font-semibold">{label}</div>
                              <div className="text-sm">Total amount: {p.totalAmount} g</div>
                              <div className="text-sm">Fed: {p.fedCount} • Skipped: {p.skippedCount} • Failed: {p.failedCount}</div>
                            </div>
                          );
                        }}
                      />
                      {/* Use site chart color variable and make bars slimmer with rounded top corners */}
                      <Bar
                        dataKey="totalAmount"
                        // use the app primary color so the chart matches theme (adapts in light/dark)
                        fill={`hsl(var(--primary))`}
                        barSize={barSize}
                        radius={[6, 6, 0, 0]}
                      >
                        {chartData.map((_, i) => (
                          <Cell
                            key={i}
                            // apply a subtle drop-shadow only to the hovered bar
                            style={{
                              filter: hoveredBar === i ? "drop-shadow(0 6px 12px rgba(0,0,0,0.12))" : "none",
                              transition: "filter 120ms ease",
                            }}
                            onMouseEnter={() => setHoveredBar(i)}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all feeding history records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} data-testid="button-confirm-clear">
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
