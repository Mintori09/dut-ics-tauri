"use client";

import { useEffect, useRef, useState } from "react";
import { RouteType } from "../../routes/config";
import { Button } from "../../components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { cn } from "../../lib/utils";
import SidebarItem from "./SidebarItem";

type Props = {
  item: RouteType;
  collapsed?: boolean;
};

const SidebarItemCollapse = ({ item, collapsed }: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const { appState } = useSelector((state: RootState) => state.appState);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appState.includes(item.state)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [appState, item]);

  if (!item.props || !item.path) return null;

  return (
    <div className="w-full">
      {/* Parent Item */}
      <Button
        variant="ghost"
        style={{ fontFamily: "SF Pro Display" }}
        className={cn(
          "w-full justify-start px-3 py-2 rounded-md transition-all duration-200",
          "hover:scale-105 hover:bg-muted",
          collapsed ? "justify-center px-2" : "justify-start",
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center flex-1">
          {item.props.icon && (
            <span className={cn("mr-2", collapsed && "mr-0")}>
              {item.props.icon}
            </span>
          )}
          {!collapsed && (
            <span className="ml-1.5">{item.props.displayText}</span>
          )}
        </div>
        {!collapsed && (open ? <ChevronDown /> : <ChevronRight />)}
      </Button>

      {/* Collapse Children */}
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-[max-height] duration-300 ease-in-out ml-4 border-l pl-2",
          open ? "max-h-[500px]" : "max-h-0",
        )}
      >
        {item.child?.map((route, index) =>
          route.props ? (
            route.child ? (
              <SidebarItemCollapse
                item={route}
                key={index}
                collapsed={collapsed}
              />
            ) : (
              <SidebarItem item={route} key={index} collapsed={collapsed} />
            )
          ) : null,
        )}
      </div>
    </div>
  );
};

export default SidebarItemCollapse;
