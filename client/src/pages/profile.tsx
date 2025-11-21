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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8" style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '100px', maxWidth: '100%' }}>
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
            src="/assets/solar_cat-outline.svg" 
            alt="Cat Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pet Name di bawah avatar */}
      <div className="flex justify-center mb-6" style={{ marginTop: '0px' }}>
        {isEditing ? (
          <Input
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            data-testid="input-pet-name"
            style={{
              width: '145px',
              height: '36px',
              borderRadius: '20px',
              border: '0.5px solid #797979',
              paddingLeft: '15px',
              color: '#174143',
              fontFamily: 'Montserrat',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.42px',
              backgroundColor: 'transparent'
            }}
          />
        ) : (
          <p 
            className="text-xl font-semibold" 
            data-testid="text-pet-name"
            style={{
              color: '#174143',
              textAlign: 'center',
              fontFamily: 'Poppins',
              fontSize: '28px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '0.84px',
              width: '145px'
            }}
          >
            {petName}
          </p>
        )}
      </div>

      <Card 
        className="mx-auto w-full max-w-[347px] px-4 sm:px-0"
        style={{
          height: 'auto',
          flexShrink: 0,
          borderRadius: '30px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #F5E5E1 7.21%, #FFF6F4 100%)',
          position: 'relative',
          paddingBottom: '20px'
        }}
      >
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
          {!isEditing ? (
            <Button
              onClick={startEdit}
              size="icon"
              variant="ghost"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              <img src="/assets/lucide_pen-line.svg" alt="Edit" className="h-4 w-4" style={{ filter: 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)' }} />
            </Button>
          ) : (
            <>
              <Button
                onClick={saveNames}
                size="icon"
                variant="ghost"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <Check className="h-4 w-4" style={{ color: '#4CAF50' }} />
              </Button>
              <Button
                onClick={cancelEdit}
                size="icon"
                variant="ghost"
                style={{ width: '32px', height: '32px', padding: 0 }}
              >
                <img src="/assets/stash_times.svg" alt="Cancel" className="h-4 w-4" style={{ filter: 'brightness(0) saturate(100%) invert(31%) sepia(13%) saturate(1654%) hue-rotate(332deg) brightness(92%) contrast(90%)' }} />
              </Button>
            </>
          )}
        </div>
        <CardContent style={{padding: '20px 20px 0 20px'}}>
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
                  className="w-full max-w-[291px]"
                  style={{
                    height: '36px',
                    borderRadius: '20px',
                    border: '0.5px solid #797979',
                    paddingLeft: '15px',
                    color: '#174143',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.42px',
                    backgroundColor: 'transparent'
                  }}
                />
              ) : (
                <div 
                  data-testid="text-owner-name"
                  className="w-full max-w-[291px]"
                  style={{
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
                    backgroundColor: 'transparent'
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
                  letterSpacing: '0.42px',
                  marginBottom: '8px'
                }}
              >
                Email
              </p>
              <div className="flex items-center gap-3">
                <img src="/assets/eva_email-outline.svg" alt="Email" style={{ width: '20px', height: '20px', flexShrink: 0, aspectRatio: '1/1', filter: 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)' }} />
                <div 
                  data-testid="text-email"
                  style={{
                    color: '#174143',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: '0.42px'
                  }}
                >
                  {user?.email ?? '—'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="mx-auto w-full max-w-[347px]"
        style={{
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/assets/pajamas_notifications.svg" alt="Notifications" style={{ width: '20px', height: '20px', flexShrink: 0, aspectRatio: '1/1', filter: 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)' }} />
                <Label 
                  htmlFor="notifications" 
                  style={{
                    height: '17px',
                    flexShrink: 0,
                    color: '#174143',
                    textAlign: 'left',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: '0.42px'
                  }}
                >
                  Push Notifications
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
                data-testid="switch-notifications"
                style={{ marginLeft: '0' }}
                className="data-[state=checked]:bg-[#6F8788]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/assets/ic_baseline-language.svg" alt="Language" style={{ width: '20px', height: '20px', flexShrink: 0, filter: 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)' }} />
                <Label 
                  htmlFor="language" 
                  style={{
                    height: '17px',
                    flexShrink: 0,
                    color: '#174143',
                    textAlign: 'left',
                    fontFamily: 'Montserrat',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: '0.42px'
                  }}
                >
                  Language
                </Label>
              </div>
              <div 
                data-testid="text-language"
                style={{
                  height: '17px',
                  flexShrink: 0,
                  color: '#174143',
                  textAlign: 'right',
                  fontFamily: 'Montserrat',
                  fontSize: '13px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: '0.39px'
                }}
              >
                English
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto w-full max-w-[347px]">
        <Button
          className="w-full border hover:opacity-90 transition-opacity [&>*]:!text-[#815247]"
          onClick={() => setLogoutOpen(true)}
          data-testid="button-logout"
          type="button"
          style={{
            height: '50px',
            borderRadius: '20px',
            border: '0.5px solid #797979',
            background: 'white',
            color: '#815247',
            textAlign: 'center',
            fontFamily: 'Montserrat',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '0.42px'
          }}
        >
          <LogOut className="h-5 w-5 mr-2" style={{ color: '#815247', stroke: '#815247' }} />
          <span style={{ color: '#815247', fontFamily: 'Montserrat', fontSize: '14px', fontWeight: 600, letterSpacing: '0.42px' }}>Log Out</span>
        </Button>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button 
                  onClick={confirmLogout}
                  style={{
                    backgroundColor: '#815247',
                    color: 'white',
                    borderColor: '#815247'
                  }}
                  className="hover:opacity-90"
                >
                  Log out
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setLogoutOpen(false)}
                  style={{
                    color: '#815247',
                    borderColor: '#815247'
                  }}
                >
                  Cancel
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
