import { RouteType } from "../../routes/config";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { cn } from "../../lib/utils";

type Props = {
  item: RouteType;
  collapsed?: boolean;
};

const SidebarItem = ({ item, collapsed }: Props) => {
  const { appState } = useSelector((state: RootState) => state.appState);

  if (!item.props || !item.path) return null;

  const isActive = appState === item.state;

  return (
    <Button
      asChild
      variant="ghost"
      style={{ fontFamily: "SF Pro Display" }}
      className={cn(
        "w-full justify-start px-3 py-2 rounded-md transition-all duration-200",
        "hover:scale-105 hover:bg-muted",
        isActive && "bg-gray-300 font-medium shadow-sm",
        collapsed ? "justify-center px-2" : "justify-start",
      )}
    >
      <Link to={item.path}>
        {/* icon */}
        {item.props.icon && (
          <span className={cn("mr-2 flex items-center", collapsed && "mr-0")}>
            {item.props.icon}
          </span>
        )}
        {/* text */}
        {!collapsed && item.props.displayText}
      </Link>
    </Button>
  );
};

export default SidebarItem;
