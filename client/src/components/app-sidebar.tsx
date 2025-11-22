import { Home, Calendar, History, Sliders, Camera, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Home", url: "/", iconPath: "/assets/material-symbols-light_home-outline-rounded.svg" },
  { title: "Schedule", url: "/schedule", iconPath: "/assets/mynaui_calendar.svg" },
  { title: "History", url: "/history", iconPath: "/assets/solar_history-line-duotone.svg" },
  { title: "Camera", url: "/camera", iconPath: "/assets/solar_camera-outline.svg" },
  // Profile removed from sidebar menu — accessible via top-right profile icon
];

export function AppSidebar() {
  const [location] = useLocation();
  const { open } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon"
      className="sidebar-transparent"
      style={{
        borderRadius: '0',
        background: 'linear-gradient(180deg, #F5E5E1 0%, #427A76 51.39%, #174143 78.39%)',
        boxShadow: '0 3px 3.2px -1px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations - only visible when sidebar is open */}
      {open && (
        <>
          {/* Extra large decoration at bottom center-right - ON TOP */}
          <div
            style={{
              position: 'absolute',
              bottom: '5px',
              right: '10%',
              width: '150px',
              height: '150px',
              pointerEvents: 'none',
              zIndex: 2,
              opacity: 0.7
            }}
          >
            <img 
              src="/assets/Diseño sin título (12) 4.svg"
              alt="Sidebar decoration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'rotate(10deg)'
              }}
            />
          </div>
          
          {/* Large decoration at bottom left */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '15px',
              width: '120px',
              height: '120px',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.6
            }}
          >
            <img 
              src="/assets/Diseño sin título (12) 4.svg"
              alt="Sidebar decoration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'rotate(-15deg)'
              }}
            />
          </div>
          
          {/* Medium decoration at bottom right */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '20px',
              width: '80px',
              height: '80px',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.5
            }}
          >
            <img 
              src="/assets/Diseño sin título (12) 4.svg"
              alt="Sidebar decoration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'rotate(25deg)'
              }}
            />
          </div>
          
          {/* Small decoration at center bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '60px',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: 0.4
            }}
          >
            <img 
              src="/assets/Diseño sin título (12) 4.svg"
              alt="Sidebar decoration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'rotate(-10deg)'
              }}
            />
          </div>
        </>
      )}
      <SidebarHeader className="p-6 pb-4" style={{ position: 'relative', zIndex: 1 }}>
      </SidebarHeader>
      <SidebarContent style={{ position: 'relative', zIndex: 1 }}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = location === item.url;
                const isLast = idx === menuItems.length - 1;
                const isHome = item.title === "Home";
                return (
                  <SidebarMenuItem key={item.title} style={{ marginBottom: isLast ? 0 : '32px' }}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`link-${item.title.toLowerCase()}`} data-active={isActive}>
                      <Link href={item.url} data-active={isActive}>
                        <img 
                          src={item.iconPath} 
                          alt={`${item.title} icon`} 
                          className="sidebar-icon"
                          style={{
                            '--icon-width': isHome ? '36px' : '31px',
                            '--icon-height': isHome ? '36px' : '31px',
                            width: isHome ? '36px' : '31px',
                            height: isHome ? '36px' : '31px',
                            minWidth: isHome ? '36px' : '31px',
                            minHeight: isHome ? '36px' : '31px',
                            maxWidth: isHome ? '36px' : '31px',
                            maxHeight: isHome ? '36px' : '31px',
                            flexShrink: 0,
                            aspectRatio: '1/1',
                            objectFit: 'contain',
                            filter: isActive 
                              ? 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)'
                              : 'brightness(0) saturate(100%) invert(100%)'
                          } as React.CSSProperties}
                        />
                        <span 
                          className={isActive ? 'text-green-500' : 'text-white'}
                          style={{
                            fontFamily: 'Montserrat',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            lineHeight: 'normal',
                            letterSpacing: '0.42px'
                          }}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
