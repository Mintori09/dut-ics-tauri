import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarMenu,
} from "../../components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { mainLayout } from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";
import { Button } from "../ui/button";

type Props = {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export default function AppSidebar({ collapsed, setCollapsed }: Props) {
  return (
    <SidebarProvider>
      <Sidebar
        className={cn(
          "border-r shadow-sm transition-all duration-300 flex flex-col",
          collapsed ? "w-[60px]" : "w-64",
        )}
      >
        {/* Header */}
        <SidebarHeader className="flex items-center justify-between p-2">
          {/* {!collapsed && ( */}
          {/* <Avatar className="h-8 w-8"> */}
          {/*   <img src={assets.images.logo} alt="Logo" /> */}
          {/* </Avatar> */}
          {/* )} */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarHeader>

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
