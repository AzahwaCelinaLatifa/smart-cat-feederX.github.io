import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Link } from "wouter";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Cat } from "lucide-react";
// Sidebar component removed to keep mobile layout consistent on desktop
import { BottomNav } from "@/components/bottom-nav";
import Home from "@/pages/home";
import Schedule from "@/pages/schedule";
import Login from "@/pages/Login";
import VerifyEmail from "@/pages/VerifyEmail";
import History from "@/pages/history";
import Camera from "@/pages/camera";
import Profile from "@/pages/profile";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function Router() {
  const { user, loading } = useAuth();
  return (
    <Switch>
      {/* Public auth-related routes */}
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      {!user ? (
        <Route path="/*" component={Login} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/history" component={History} />
          {/* Control route removed from navigation */}
          <Route path="/camera" component={Camera} />
          <Route path="/profile" component={Profile} />
        </>
      )}
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // profile open state is managed inside ProfileDrawer

  // Move profile drawer into a child component that consumes auth.
  // This ensures we only render the avatar + drawer when a user is logged in.
  function ProfileDrawer() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (!open) return;
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }, [open]);

    if (!user) return null;

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {/* Avatar placed in header (left) - no fixed positioning so it flows with header layout */}
          <button
            aria-label="Open profile"
            className="rounded-full shadow-md hover-elevate active-elevate-2 p-0"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Cat className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </button>
        </DrawerTrigger>

        <DrawerContent className="inset-y-0 right-0 left-auto top-0 bottom-0 w-full max-w-xs md:max-w-sm md:w-96 rounded-l-[10px] mt-0 h-full overflow-auto flex flex-col">
          <DrawerHeader>
            <div className="flex items-center justify-end">
              <DrawerClose asChild>
                <button aria-label="Close profile" className="rounded-md p-2 hover:bg-muted">Close</button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          {/* Render the Profile page inside a scrollable area that stops at the logout button */}
          <div className="px-4 flex-1 overflow-auto" style={{ overscrollBehavior: 'contain' }}>
            <Profile />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <AuthProvider>
            <div className="flex h-screen w-full">
              <div className="flex flex-col flex-1">
                {/* Header: left-aligned cat avatar will appear here when user is authenticated */}
                <header className="w-full flex items-center justify-between px-4 md:px-6 py-3">
                  <div className="flex items-center">
                    <ProfileDrawer />
                  </div>
                  {/* placeholder for right-side header controls if needed */}
                  <div />
                </header>

                <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
                  <div className="max-w-6xl mx-auto">
                    <Router />
                  </div>
                </main>
              </div>
            </div>
            <BottomNav />
          </AuthProvider>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;