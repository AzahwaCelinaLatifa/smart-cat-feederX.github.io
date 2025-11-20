import { useState, useEffect } from "react";
import { User, Bell, Globe, LogOut, Cat, Edit3, Check, X, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoFeeding, setAutoFeeding] = useState(true);

  // Editable pet & owner names (persisted to localStorage)
  const [petName, setPetName] = useState("Mochi");
  const [ownerName, setOwnerName] = useState("Celina");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem("pf_pet_name");
      const o = localStorage.getItem("pf_owner_name");
      if (p) setPetName(p);
      if (o) setOwnerName(o);
    } catch (e) {
      // ignore
    }
  }, []);
  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    toast({
      title: checked ? "Notifications enabled" : "Notifications disabled",
      description: checked 
        ? "You will receive feeding alerts" 
        : "Feeding notifications have been turned off",
    });
  };

  const handleAutoFeedingToggle = (checked: boolean) => {
    setAutoFeeding(checked);
    toast({
      title: checked ? "Auto-feeding enabled" : "Auto-feeding disabled",
      description: checked
        ? "Your cat will be fed according to the schedule"
        : "Automatic feeding has been turned off",
    });
  };

  // Language is fixed to English. We keep a toast for potential future actions.
  const language = "en";

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  const confirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setLogoutOpen(false);
      toast({ title: "Logged out", description: "You have been successfully logged out" });
    } catch (e: any) {
      setLogoutOpen(false);
      toast({ title: "Error", description: e?.message || "Could not log out" });
    }
  };

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    try {
      const p = localStorage.getItem("pf_pet_name");
      const o = localStorage.getItem("pf_owner_name");
      if (p) setPetName(p);
      if (o) setOwnerName(o);
    } catch (e) {}
    setIsEditing(false);
  };

  const saveNames = () => {
    try {
      localStorage.setItem("pf_pet_name", petName);
      localStorage.setItem("pf_owner_name", ownerName);
    } catch (e) {}
    setIsEditing(false);
    toast({ title: "Saved", description: "Pet and owner name updated" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 
          className="text-3xl font-bold text-foreground"
          style={{
            color: '#174143',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '0.84px'
          }}
        >
          Profile
        </h1>
        <p 
          className="text-muted-foreground mt-1"
          style={{
            color: '#174143',
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '0.42px'
          }}
        >
          Manage your account settings
        </p>
      </div>

      {/* Avatar kucing di luar card */}
      <div className="flex justify-center mb-6">
        <div 
          className="h-20 w-20 rounded-full overflow-hidden border-2 shadow-md"
          style={{
            borderColor: '#174143',
            backgroundColor: '#174143'
          }}
        >
          <img 
            src="/assets/solar_cat-broken.png" 
            alt="Cat Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pet Name di bawah avatar */}
      <div className="flex justify-center mb-6">
        {isEditing ? (
          <Input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            data-testid="input-pet-name"
            className="w-48 text-center text-xl font-semibold"
            style={{
              fontFamily: 'Poppins',
              color: '#174143',
              border: '2px solid #174143'
            }}
          />
        ) : (
          <p 
            className="text-xl font-semibold" 
            data-testid="text-pet-name"
            style={{
              fontFamily: 'Poppins',
              color: '#174143'
            }}
          >
            {petName}
          </p>
        )}
      </div>

      <Card 
        className="mx-auto"
        style={{
          width: '347px',
          height: '181px',
          flexShrink: 0,
          borderRadius: '30px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #F5E5E1 7.21%, #FFF6F4 100%)'
        }}
      >
        <CardContent style={{padding: '20px'}}>
          <div className="flex flex-col gap-4">
            <div>
              <p 
                style={{
                  color: '#6C6C6C',
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: 'normal',
                  letterSpacing: '0.42px'
                }}
              >
                Owner Name
              </p>
              {isEditing ? (
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  data-testid="input-owner-name"
                  className="w-48"
                />
              ) : (
                <div 
                  data-testid="text-owner-name"
                  style={{
                    width: '291px',
                    height: '36px',
                    flexShrink: 0,
                    borderRadius: '20px',
                    border: '0.5px solid #797979',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '15px',
                    color: '#174143',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: '0.42px',
                    backgroundColor: 'white'
                  }}
                >
                  {ownerName}
                </div>
              )}
            </div>
            <div>
              <p 
                style={{
                  color: '#6C6C6C',
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: 'normal',
                  letterSpacing: '0.42px'
                }}
              >
                Email
              </p>
              <div 
                data-testid="text-email"
                style={{
                  width: '291px',
                  height: '36px',
                  flexShrink: 0,
                  borderRadius: '20px',
                  border: '0.5px solid #797979',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '15px',
                  color: '#174143',
                  fontFamily: 'Montserrat',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: 'normal',
                  letterSpacing: '0.42px',
                  backgroundColor: 'white'
                }}
              >
                {user?.email ?? '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="mx-auto"
        style={{
          width: '347px',
          height: '181px',
          flexShrink: 0,
          borderRadius: '30px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #F5E5E1 7.21%, #FFF6F4 100%)'
        }}
      >
        <CardHeader style={{padding: '20px 20px 0px 20px', marginBottom: '0px'}}>
          <CardTitle 
            style={{
              width: '145px',
              height: '50px',
              flexShrink: 0,
              color: '#174143',
              textAlign: 'center',
              fontFamily: 'Poppins',
              fontSize: '28px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.84px'
            }}
          >
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent style={{padding: '10px 20px 0px 20px'}}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <Label 
                htmlFor="notifications" 
                style={{
                  width: '253px',
                  height: '17px',
                  flexShrink: 0,
                  color: '#174143',
                  textAlign: 'left',
                  fontFamily: 'Montserrat',
                  fontSize: '13px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: '0.39px'
                }}
              >
                Push Notifications
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
                data-testid="switch-notifications"
                style={{marginLeft: '-20px'}}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Label 
                  htmlFor="language" 
                  style={{
                    width: '253px',
                    height: '17px',
                    flexShrink: 0,
                    color: '#174143',
                    textAlign: 'left',
                    fontFamily: 'Montserrat',
                    fontSize: '13px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    letterSpacing: '0.39px'
                  }}
                >
                  Language
                </Label>
              </div>
              <div 
                data-testid="text-language"
                style={{
                  width: '40px',
                  height: '17px',
                  flexShrink: 0,
                  color: '#174143',
                  textAlign: 'left',
                  fontFamily: 'Montserrat',
                  fontSize: '13px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: '0.39px',
                  marginLeft: '-70px'
                }}
              >
                English
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button
          className="w-full border border-input text-destructive hover:text-destructive bg-background"
          onClick={() => setLogoutOpen(true)}
          data-testid="button-logout"
          type="button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setLogoutOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmLogout}>Log out</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
