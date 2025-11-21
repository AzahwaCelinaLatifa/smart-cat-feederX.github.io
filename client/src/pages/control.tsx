import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

import { manualFeed } from "@/services/api";

export default function Control() {
  const { toast } = useToast();

  // 🔹 State untuk dialog dan loading
  const [showFeedDialog, setShowFeedDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // (Auto-feeding setting moved to Profile > Settings)

  // 🔹 Handle Feed Now
  const handleFeedNow = async () => {
    setShowFeedDialog(false);
    setLoading(true);

    toast({
      title: "Feeding in progress",
      description: "Dispensing food now...",
    });

    try {
      // Call backend API to record manual feed (portion 2 by default)
      const res = await manualFeed(2);
      console.log("FeedNow success:", res);

      toast({
        title: "Feeding command sent!",
        description: `Portion dispensed: 2`,
      });
    } catch (err: any) {
      console.error("FeedNow failed:", err);
      toast({
        title: "Error sending command",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Control Panel</h1>
        <p className="text-muted-foreground mt-1">Manage feeding controls</p>
      </div>

      {/* Manual Feed Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Manual Feed
          </CardTitle>
          <CardDescription>
            Dispense food immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowFeedDialog(true)}
            size="lg"
            className="w-full md:w-auto"
            data-testid="button-manual-feed"
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? "Feeding..." : "Feed Now"}
          </Button>
        </CardContent>
      </Card>

      {/* Auto-Feeding setting moved to Profile > Settings */}

      {/* Feed Now Dialog */}
      <AlertDialog open={showFeedDialog} onOpenChange={setShowFeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feed your cat now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will dispense food immediately, outside of the regular schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={handleFeedNow} 
              data-testid="button-confirm-manual-feed"
              disabled={loading}
              style={{
                backgroundColor: '#174143',
                color: 'white'
              }}
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
