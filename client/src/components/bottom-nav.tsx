import { Home, Calendar, History, Sliders, Camera, User } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "History", url: "/history", icon: History },
  { title: "Camera", url: "/camera", icon: Camera },
  { title: "Profile", url: "/profile", icon: User },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border md:hidden z-50">
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
              <button className="flex flex-col items-center justify-center h-full px-3 min-w-[60px] hover-elevate active-elevate-2 rounded-md">
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-1" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
