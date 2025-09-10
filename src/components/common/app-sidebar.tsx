import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarMenu,
} from "../../components/ui/sidebar";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { mainLayout } from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";
import { Button } from "../ui/button";
import { useEffect } from "react";

type Props = {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export default function AppSidebar({ collapsed, setCollapsed }: Props) {
  // Chỉ chạy một lần khi load
  useEffect(() => {
    const minimizeSidebar = async () => {
      const size = await getCurrentWindow().innerSize();
      if (size.width < 1000) {
        setCollapsed(true); // auto collapse khi màn nhỏ
      }
    };
    minimizeSidebar();
  }, [setCollapsed]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        className={cn(
          "border-r shadow-sm transition-all duration-300 flex flex-col h-full fixed left-0 top-0 z-40",
          collapsed ? "w-[50px]" : "w-50",
        )}
        // 👇 disable responsive behavior
        collapsible="none"
      >
        {/* Header toggle */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {mainLayout.map((route, index) =>
                route.props ? (
                  route.child ? (
                    <SidebarItemCollapse item={route} key={index} />
                  ) : (
                    <SidebarItem item={route} key={index} />
                  )
                ) : null,
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="p-2 text-sm text-gray-500">
          {!collapsed ? "© 2025 MyApp" : "©"}
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
