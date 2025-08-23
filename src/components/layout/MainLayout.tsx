import SideBar from "../common/app-sidebar";
import colorConfigs from "../../configs/colorConfigs";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // tự động ẩn khi nhỏ
      } else {
        setCollapsed(false); // tự động hiện khi đủ lớn
      }
    };

    // chạy lần đầu khi mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      {!collapsed && (
        <div className={cn("transition-all duration-300 flex-shrink-0 w-64")}>
          <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
      )}

      {/* Main content */}
      <main
        className="flex-1 min-h-screen m-2 rounded-lg shadow p-4 transition-all duration-300"
        style={{ backgroundColor: colorConfigs.mainBg }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
