import { useState, useEffect } from "react";
import { Clock, Droplet, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/components/ui/sidebar";
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

export default function Home() {
  const { toast } = useToast();
  const [showFeedDialog, setShowFeedDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { open } = useSidebar();
  
  // Adjust gap based on sidebar state
  const cardGap = open ? '0.5cm' : '1cm';
  // Adjust margin for right column cards based on sidebar state
  const rightCardMargin = open ? '0px' : '-150px';
  
  // Real-time weight data from ESP32
  const [foodGrams, setFoodGrams] = useState(0);
  const [foodPercent, setFoodPercent] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('Waiting for data...');
  const capacityGrams = 150;
  const nextFeeding = "7:00 PM";
  const lastFed = "2:00 PM";

  // Fetch weight data from backend
  useEffect(() => {
    const updateFoodLevel = async () => {
      try {
        const response = await fetch('/api/weight');
        const data = await response.json();
        
        const weight = parseFloat(data.weight) || 0;
        const percentage = parseFloat(data.percentage) || 0;
        
        setFoodGrams(Math.round(weight));
        setFoodPercent(Math.min(percentage, 100));
        
        const now = new Date();
        setLastUpdate(`✓ Updated: ${now.toLocaleTimeString()}`);
        
        console.log(`📊 Weight: ${weight}g (${percentage}%)`);
      } catch (error) {
        console.error('❌ Error:', error);
        setLastUpdate('❌ Connection error');
      }
    };

    // Update every 1 second
    const interval = setInterval(updateFoodLevel, 1000);
    updateFoodLevel(); // Run immediately
    
    return () => clearInterval(interval);
  }, []);

  const handleFeedNow = async () => {
    setShowFeedDialog(false);
    setLoading(true);

    toast({
      title: "Feeding in progress",
      description: "Dispensing food now...",
    });

    try {
      // Call backend API to trigger ESP32 servo
      const res = await manualFeed(2);
      console.log("FeedNow success:", res);

      toast({
        title: "Feeding command sent!",
        description: "Your cat is being fed now!",
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
    <div className="space-y-6" style={{marginTop: '-20px', paddingTop: '0', position: 'relative'}}>
      {/* Background image in top right corner */}
      <div 
        style={{
          position: 'absolute',
          top: '-30px',
          right: '0',
          display: 'flex',
          width: '250px',
          height: '170px',
          transform: 'rotate(-0.905deg)',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <img 
          src="/assets/c30ce538219f24d478fbec24c03259d4bd5ae829.png"
          alt="Background decoration"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      
      <div style={{marginTop: '0', paddingTop: '0', position: 'relative', zIndex: 1}}>
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
          Dashboard
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
          Monitor your cat's feeding status
        </p>
      </div>
      
      {/* Top Row: Next Feeding and Last Fed */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full" style={{gap: cardGap, position: 'relative', zIndex: 1, justifyContent: 'start'}}>
        <Card 
          className="w-full min-w-0"
          style={{
            height: '117px',
            borderRadius: '30px',
            border: '1px solid #D5D5D5',
            background: 'linear-gradient(180deg, #F5E5E1 0%, #FFF6F4 100%)'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: 'normal',
                letterSpacing: '0.36px'
              }}
            >
              Next Feeding
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold text-foreground" 
              data-testid="text-next-feeding"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: 'normal',
                letterSpacing: '0.6px'
              }}
            >
              {nextFeeding}
            </div>
            <p 
              className="text-xs text-muted-foreground mt-1"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '10px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: 'normal',
                letterSpacing: '0.3px'
              }}
            >
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card 
          className="w-full"
          style={{
            height: '117px',
            borderRadius: '30px',
            border: '1px solid #D5D5D5',
            background: 'linear-gradient(180deg, #F5E5E1 0%, #FFF6F4 100%)',
            marginLeft: rightCardMargin,
            transition: 'margin-left 0.2s ease-linear'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: 'normal',
                letterSpacing: '0.36px'
              }}
            >
              Last Fed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold text-foreground" 
              data-testid="text-last-fed"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: 'normal',
                letterSpacing: '0.6px'
              }}
            >
              {lastFed}
            </div>
            <p 
              className="text-xs text-muted-foreground mt-1"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '10px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: 'normal',
                letterSpacing: '0.3px'
              }}
            >
              Today
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Bottom Row: Food Level and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full" style={{gap: cardGap, position: 'relative', zIndex: 1, justifyContent: 'start'}}>
        <Card 
          className="w-full"
          style={{
            height: '117px',
            borderRadius: '30px',
            border: '1px solid #D5D5D5',
            background: 'linear-gradient(180deg, #F5E5E1 0%, #FFF6F4 100%)'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{
                color: '#174143',
                textAlign: 'left',
                fontFamily: 'Montserrat',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: '600',
                lineHeight: 'normal',
                letterSpacing: '0.36px'
              }}
            >
              Food Level
            </CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span 
                  id="currentWeight"
                  className="text-2xl font-bold text-foreground" 
                  data-testid="text-food-level"
                  style={{
                    color: '#815247',
                    textAlign: 'left',
                    fontFamily: 'Poppins',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: 'normal',
                    letterSpacing: '0.54px'
                  }}
                >
                  {foodGrams} g / {capacityGrams} g
                </span>
                <span 
                  className="text-sm text-muted-foreground"
                  style={{
                    color: '#174143',
                    textAlign: 'left',
                    fontFamily: 'Montserrat',
                    fontSize: '10px',
                    fontStyle: 'normal',
                    fontWeight: '600',
                    lineHeight: 'normal',
                    letterSpacing: '0.3px'
                  }}
                >
                  remaining
                </span>
              </div>
              <div style={{position: 'relative'}}>
                <Progress 
                  id="progressBar"
                  value={foodPercent} 
                  className="h-2" 
                  style={{
                    '--progress-color': foodPercent < 20 ? '#e74c3c' : foodPercent < 50 ? '#f39c12' : '#8b5a3c'
                  } as React.CSSProperties} 
                />
              </div>
              <div 
                id="lastUpdate" 
                style={{
                  fontSize: '10px',
                  color: '#999',
                  fontFamily: 'Montserrat'
                }}
              >
                {lastUpdate}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="w-full"
          style={{
            height: '117px',
            borderRadius: '30px',
            border: '1px solid #D5D5D5',
            background: 'linear-gradient(180deg, #F5E5E1 0%, #FFF6F4 100%)',
            marginLeft: rightCardMargin,
            transition: 'margin-left 0.2s ease-linear'
          }}
        >
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle 
            className="text-sm font-medium"
            style={{
              color: '#174143',
              textAlign: 'left',
              fontFamily: 'Montserrat',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: 'normal',
              letterSpacing: '0.36px'
            }}
          >
            Quick Actions
          </CardTitle>
          <img 
            src="/assets/Group (3).svg"
            alt="Quick Actions Icon"
            className="h-4 w-4"
            style={{
              objectFit: 'contain'
            }}
          />
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowFeedDialog(true)} 
            className="w-full max-w-[263px]"
            data-testid="button-feed-now"
            disabled={loading}
            style={{
              height: '39px',
              flexShrink: 0,
              borderRadius: '12px',
              background: '#815247',
              color: '#FFF',
              textAlign: 'center',
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              letterSpacing: '0.48px'
            }}
          >
            {loading ? "Feeding..." : "Feed Now"}
          </Button>
        </CardContent>
        </Card>
      </div>

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
              data-testid="button-confirm-feed"
              disabled={loading}
              style={{
                backgroundColor: '#174143',
                color: 'white'
              }}
              className="hover:opacity-90"
            >
              Confirm
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-feed">Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
