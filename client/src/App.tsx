import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Link } from "wouter";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Cat, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
// Sidebar component removed to keep mobile layout consistent on desktop
import { BottomNav } from "@/components/bottom-nav";
import { AppSidebar } from "@/components/app-sidebar";
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#174143] mx-auto"></div>
          <p className="mt-4 text-[#174143] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
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

  // Profile button with custom sidebar
  function ProfileButton() {
    const { user } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    if (!user) return null;

    return (
      <>
        <button
          onClick={() => setIsProfileOpen(true)}
          aria-label="Open profile"
          className="rounded-full shadow-md hover-elevate active-elevate-2 p-0"
        >
          <div 
            className="h-10 w-10 rounded-full overflow-hidden border-2 shadow-md"
            style={{
              borderColor: '#174143',
              backgroundColor: '#174143'
            }}
          >
            <img 
              src="/assets/solar_cat-broken.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </button>
        
        <ProfileSidebar 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      </>
    );
  }

  // Render left sidebar on desktop when authenticated
  function LeftSidebar() {
    const { user } = useAuth();
    if (!user) return null;
    return <AppSidebar />;
  }

  // Sidebar toggle button
  function SidebarToggle() {
    const { user } = useAuth();
    const { toggleSidebar } = useSidebar();
    
    if (!user) return null;
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden md:flex h-10 w-10 rounded-md hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" style={{ color: '#174143' }} />
      </Button>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <AuthProvider>
            <div className="flex h-screen w-full bg-white">
              <LeftSidebar />
              <div className="flex flex-col flex-1 bg-white">
                {/* Header: left-aligned cat avatar and sidebar toggle will appear here when user is authenticated */}
                <header className="w-full flex items-center justify-between px-4 md:px-6" style={{paddingTop: '0', paddingBottom: '0', margin: '0'}}>
                  <div className="flex items-center space-x-0.5" style={{marginTop: '0', paddingTop: '0'}}>
                    <SidebarToggle />
                    <ProfileButton />
                  </div>
                  {/* placeholder for right-side header controls if needed */}
                  <div />
                </header>

                <main className="flex-1 overflow-auto px-4 md:px-6 pb-20 md:pb-6 bg-white" style={{paddingTop: '10px'}}>
                  <div className="max-w-6xl mx-auto" style={{marginTop: '0', paddingTop: '0'}}>
                    <Router />
                  </div>
                </main>
              </div>
            </div>
            {/* Show bottom nav only on mobile */}
            <div className="md:hidden">
              <BottomNav />
            </div>
          </AuthProvider>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;