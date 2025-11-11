import { Home, Calendar, History, Sliders, Camera, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "History", url: "/history", icon: History },
  { title: "Camera", url: "/camera", icon: Camera },
  // Profile moved to top-right corner; removed from bottom nav
];

export function BottomNav() {
  const { user } = useAuth();
  // don't render the bottom navigation if there's no authenticated user
  if (!user) return null;
  const [location] = useLocation();

  return (
    // show bottom navigation on all viewports so desktop matches mobile layout
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.url;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.title}
              href={item.url}
              data-testid={`link-${item.title.toLowerCase()}-mobile`}
            >
              <button
                className={`nav-item flex flex-col items-center justify-center h-full px-3 min-w-[60px] hover-elevate active-elevate-2 rounded-md ${
                  isActive ? "active" : ""
                }`}
              >
                <Icon className={`h-6 w-6`} />
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
