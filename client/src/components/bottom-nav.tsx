import { Home, Calendar, History, Sliders, Camera, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { title: "Home", url: "/", iconPath: "/assets/material-symbols-light_home-outline-rounded.svg" },
  { title: "Schedule", url: "/schedule", iconPath: "/assets/mynaui_calendar.svg" },
  { title: "History", url: "/history", iconPath: "/assets/solar_history-line-duotone.svg" },
  { title: "Camera", url: "/camera", iconPath: "/assets/solar_camera-outline.svg" },
];

export function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 pb-4">
      <div
        className="flex items-center justify-around"
        style={{
          width: '309px',
          height: '50px',
          flexShrink: 0,
          borderRadius: '18px',
          background: 'linear-gradient(90deg, #427A76 0.01%, #174143 50.5%)',
          boxShadow: '0 3px 3.2px -1px rgba(0, 0, 0, 0.25)'
        }}
      >
        {navItems.map((item) => {
          const isActive = location === item.url;
          
          return (
            <Link
              key={item.title}
              href={item.url}
              data-testid={`link-${item.title.toLowerCase()}-mobile`}
            >
              <button
                className="nav-item flex flex-col items-center justify-center rounded-full p-3 transition-all duration-200 hover:bg-white/20 hover:backdrop-blur-md hover:shadow-lg"
                style={{
                  backgroundColor: isActive ? 'white' : 'transparent',
                  width: '48px',
                  height: '48px'
                }}
                data-active={isActive}
              >
                <img 
                  src={item.iconPath}
                  alt={item.title}
                  style={{
                    width: '24px',
                    height: '24px',
                    filter: isActive 
                      ? 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)'
                      : 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(175deg) brightness(104%) contrast(101%)'
                  }}
                />
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
