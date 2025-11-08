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
import { signOut } from "@/lib/firebase";

export default function Profile() {
  const { toast } = useToast();
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
      await signOut(undefined);
      setLogoutOpen(false);
      toast({ title: "Logged out", description: "You have been successfully logged out" });
    } catch (e) {
      setLogoutOpen(false);
      toast({ title: "Error", description: "Could not log out" });
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
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Pet Information
            </CardTitle>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={saveNames} data-testid="button-save-names">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEdit} data-testid="button-cancel-names">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={startEdit} data-testid="button-edit-names">
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                <Cat className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Pet Name</p>
              {isEditing ? (
                <Input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  data-testid="input-pet-name"
                  className="w-48"
                />
              ) : (
                <p className="text-xl font-semibold" data-testid="text-pet-name">{petName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Owner Name</p>
              {isEditing ? (
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  data-testid="input-owner-name"
                  className="w-48"
                />
              ) : (
                <p className="text-base font-medium" data-testid="text-owner-name">{ownerName}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium" data-testid="text-email">user@email.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="automatic-feeding" className="text-base font-normal">
                Automatic Feeding {autoFeeding ? "Enabled" : "Disabled"}
              </Label>
            </div>
            <Switch
              id="automatic-feeding"
              checked={autoFeeding}
              onCheckedChange={handleAutoFeedingToggle}
              data-testid="switch-automatic-feeding"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="notifications" className="text-base font-normal">
                Push Notifications
              </Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
              data-testid="switch-notifications"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="language" className="text-base font-normal">
                Language
              </Label>
            </div>
            <div className="text-base font-medium" data-testid="text-language">English</div>
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
