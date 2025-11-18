import { useState } from "react";
import { Clock, Droplet, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export default function Home() {
  const { toast } = useToast();
  const [showFeedDialog, setShowFeedDialog] = useState(false);
  
  // Mock data
  // Display food level in grams with a capacity of 50 g
  const foodPercent = 65; // stored as percent internally
  const capacityGrams = 50;
  const foodGrams = Math.round((foodPercent / 100) * capacityGrams);
  const nextFeeding = "7:00 PM";
  const lastFed = "2:00 PM";

  const handleFeedNow = () => {
    setShowFeedDialog(false);
    toast({
      title: "Feeding in progress",
      description: "Your cat is being fed now!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero / visual header (purely presentational) */}
      <section className="hero-landing rounded-lg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1">
              {/* Promotional copy removed per request. Hero remains decorative only. */}
            </div>
          </div>
        </div>
      </section>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor your cat's feeding status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Feeding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="text-next-feeding">
              {nextFeeding}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Level</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground" data-testid="text-food-level">
                  {foodGrams} g / {capacityGrams} g
                </span>
                <span className="text-sm text-muted-foreground">remaining</span>
              </div>
              <Progress value={foodPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Fed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="text-last-fed">
              {lastFed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowFeedDialog(true)} 
            className="w-full md:w-auto"
            data-testid="button-feed-now"
          >
            Feed Now
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showFeedDialog} onOpenChange={setShowFeedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feed your cat now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will dispense food immediately, outside of the regular schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-feed">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFeedNow} data-testid="button-confirm-feed">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
