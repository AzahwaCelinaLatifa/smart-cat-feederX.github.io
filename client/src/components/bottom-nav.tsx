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
    // Navigation with gradient styling from Figma
    <nav className="bottom-nav fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-4 z-50">
      <div
        className="w-[309px] h-[50px] flex-shrink-0 rounded-[18px] shadow-[0_3px_3.2px_-1px_rgba(0,0,0,0.25)] flex items-center justify-around"
        style={{
          background: 'linear-gradient(90deg, #427A76 0.01%, #174143 50.5%)'
        }}
      >
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <img
            src="/assets/image.png"
            alt="Pawsitive Feed Logo"
            className="w-48 h-48 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
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
                className={`nav-item flex flex-col items-center justify-center p-2 rounded-md transition-all duration-200 ${
                  isActive ? "hover:bg-white/10" : "hover:bg-white/10"
                }`}
                style={{
                  backgroundColor: isActive ? '#F0FDF9' : 'transparent'
                }}
              >
                <Icon className={`h-6 w-6 ${isActive ? "" : "text-white/80"}`} style={{ color: isActive ? '#174143' : 'white' }} />
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
