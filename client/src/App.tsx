import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import Home from "@/pages/home";
import Schedule from "@/pages/schedule";
import Login from "@/pages/Login";
import History from "@/pages/history";
import Camera from "@/pages/camera";
import Profile from "@/pages/profile";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function Router() {
  const { user, loading } = useAuth();
  return (
    <Switch>
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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <AuthProvider>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b border-border md:block hidden">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
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