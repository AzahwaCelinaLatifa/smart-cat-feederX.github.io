import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type EspStatus = {
  isFeeding: boolean;
  hasPending?: boolean;
  servoPosition?: number;
  cooldownMsRemaining?: number;
  ip?: string;
};

export default function Control() {
  const { toast } = useToast();

  // Konfigurasi IP ESP32 AI detection (port 80)
  const ESP32_AI_IP = "10.32.10.122"; // ganti sesuai IP ESP32 AI
  const FEED_URL = `http://${ESP32_AI_IP}/feed`;
  const STATUS_URL = `http://${ESP32_AI_IP}/status`;

  // Optional: jika ESP32 memakai token Authorization
  const AUTH_TOKEN = ""; // "SECRET123"
  const buildHeaders = () => {
    const h: Record<string, string> = {};
    if (AUTH_TOKEN) h["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    return h;
  };

  const [showFeedDialog, setShowFeedDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [espStatus, setEspStatus] = useState<EspStatus | null>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const resp = await fetch(STATUS_URL, { method: "GET" });
        if (!resp.ok) throw new Error(`ESP32 status HTTP ${resp.status}`);
        const data: EspStatus = await resp.json();
        if (active) setEspStatus(data);
      } catch (err) {
        console.error("Status fetch failed:", err);
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { active = false; clearInterval(id); };
  }, [STATUS_URL]);

  const handleFeedNow = async () => {
    setShowFeedDialog(false);
    setLoading(true);
    toast({ title: "Feeding in progress", description: "Dispensing food now..." });

    try {
      const resp = await fetch(FEED_URL, { method: "POST", headers: buildHeaders() });
      const text = await resp.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (resp.ok) {
        toast({
          title: "Feeding command sent!",
          description: data?.message ?? "Feeding completed",
        });
      } else {
        const msg = data?.message ?? (data?.remaining_ms ? `Cooldown remaining: ${data.remaining_ms} ms` : `HTTP ${resp.status}`);
        toast({ title: "Feeding not executed", description: msg, variant: "destructive" });
      }
    } catch (err: any) {
      console.error("FeedNow failed:", err);
      toast({ title: "Error sending command", description: err?.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const feedingStateText = (() => {
    if (!espStatus) return "Checking device...";
    if (espStatus.isFeeding) return "Feeding";
    if (typeof espStatus.cooldownMsRemaining === "number" && espStatus.cooldownMsRemaining > 0)
      return `Cooldown: ${(espStatus.cooldownMsRemaining / 1000).toFixed(1)}s`;
    return "Ready";
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Control Panel</h1>
        <p className="text-muted-foreground mt-1">Manage feeding controls</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Manual Feed
          </CardTitle>
          <CardDescription>Dispense food immediately</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div><strong>Device:</strong> ESP32 AI @ {ESP32_AI_IP}</div>
            <div><strong>Status:</strong> {feedingStateText}</div>
            {typeof espStatus?.servoPosition === "number" && (
              <div><strong>Servo:</strong> {espStatus.servoPosition}°</div>
            )}
            {espStatus?.hasPending && <div><strong>Queue:</strong> 1 pending</div>}
          </div>

          <Button
            onClick={() => setShowFeedDialog(true)}
            size="lg"
            className="w-full md:w-auto"
            data-testid="button-manual-feed"
            disabled={loading || espStatus?.isFeeding === true}
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? "Feeding..." : "Feed Now"}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showFeedDialog} onOpenChange={setShowFeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feed your cat now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will dispense food immediately on the ESP32 AI device ({ESP32_AI_IP}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleFeedNow}
              data-testid="button-confirm-manual-feed"
              disabled={loading}
              style={{ backgroundColor: "#174143", color: "white" }}
              className="hover:opacity-90"
            >
              Confirm
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-manual-feed">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}