import { Outlet } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MobileNavbar, menuItems, userMenuItems } from "./pages/Index";
import { useState, useEffect } from "react";
import { User, Settings, CreditCard } from "lucide-react";

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("Bosh sahifa");
  const [activeProject, setActiveProject] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='));
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <div className="md:hidden">
          <MobileNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            isLoggedIn={isLoggedIn}
          />
        </div>
        <div className="hidden md:block">
          <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center justify-center">
                <span className="font-bold text-2xl text-sidebar-foreground">
                  ProX
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeTab === item.title && !activeProject}
                      className="w-full justify-start"
                      onClick={() => { setActiveTab(item.title); setActiveProject(""); }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              {isLoggedIn && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-3">
                    Mening kurslarim
                  </h3>
                  <SidebarMenu>
                    {userMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={activeTab === item.title && !activeProject}
                          className="w-full justify-start"
                          onClick={() => { setActiveTab(item.title); setActiveProject(""); }}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </div>
              )}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-3">
                  Sozlamalar
                </h3>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeProject === "Blogs"}
                      className="w-full justify-start"
                      onClick={() => { setActiveTab("Loyihalar"); setActiveProject("Blogs"); }}
                    >
                      <User className="w-4 h-4" />
                      <span>Profil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeProject === "Resume Builder"}
                      className="w-full justify-start"
                      onClick={() => { setActiveTab("Loyihalar"); setActiveProject("Resume Builder"); }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Xavfsizlik</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {isLoggedIn && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeProject === "Payments"}
                        className="w-full justify-start"
                        onClick={() => { setActiveTab("Loyihalar"); setActiveProject("Payments"); }}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>To'lovlar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>
        </div>
        <SidebarInset className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 md:pt-4 pt-28 pb-16">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 