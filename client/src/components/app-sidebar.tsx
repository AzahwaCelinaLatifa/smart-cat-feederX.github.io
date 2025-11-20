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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Home", url: "/", iconPath: "/assets/material-symbols-light_home-outline-rounded (1).png" },
  { title: "Schedule", url: "/schedule", iconPath: "/assets/mynaui_calendar (1).png" },
  { title: "History", url: "/history", iconPath: "/assets/solar_history-line-duotone (1).png" },
  { title: "Camera", url: "/camera", iconPath: "/assets/solar_camera-outline (1).png" },
  // Profile removed from sidebar menu — accessible via top-right profile icon
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar 
      collapsible="icon"
      className="sidebar-transparent"
      style={{
        background: 'transparent'
      }}
    >
      <SidebarHeader className="p-6 pb-4">
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = location === item.url;
                const isLast = idx === menuItems.length - 1;
                const isHome = item.title === "Home";
                return (
                  <SidebarMenuItem key={item.title} style={{ marginBottom: isLast ? 0 : '32px' }}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`link-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <img 
                          src={item.iconPath} 
                          alt={`${item.title} icon`} 
                          style={{
                            width: isHome ? '36px' : '31px',
                            height: isHome ? '36px' : '31px',
                            flexShrink: 0,
                            aspectRatio: '1/1',
                            objectFit: 'contain',
                            filter: 'brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(1943%) hue-rotate(138deg) brightness(96%) contrast(93%)'
                          }}
                        />
                        <span 
                          style={{
                            color: '#174143',
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
