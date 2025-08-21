import SideBar from "../common/app-sidebar";
import sizeConfigs from "../../configs/sizeConfigs";
import colorConfigs from "../../configs/colorConfigs";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { cn } from "../../lib/utils";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 flex-shrink-0",
          collapsed ? "w-[60px]" : `w-[${sizeConfigs.sidebar.width}px]`,
        )}
      >
        <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main content */}
      <main
        className="flex-1 min-h-screen"
        style={{ backgroundColor: colorConfigs.mainBg }}
      >
        {/* Thay cho <Toolbar /> của MUI */}
        <div className="h-14" />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
