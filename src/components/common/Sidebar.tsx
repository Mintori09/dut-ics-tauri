import {
    Avatar,
    Drawer,
    IconButton,
    List,
    Stack,
    Toolbar,
    Tooltip
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import sizeConfigs from "../../configs/sizeConfigs";
import assets from "../../assets";
import colorConfigs from "../../configs/colorConfigs";
import { mainLayout } from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";

type Props = {
    collapsed: boolean,
    setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
}

const Sidebar = ({ collapsed, setCollapsed }: Props) => {

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? 60 : sizeConfigs.sidebar.width,
                flexShrink: 0,
                whiteSpace: "nowrap",
                "& .MuiDrawer-paper": {
                    width: collapsed ? 60 : sizeConfigs.sidebar.width,
                    boxSizing: "border-box",
                    borderRight: "0px",
                    backgroundColor: colorConfigs.sidebar.bg,
                    color: colorConfigs.sidebar.color,
                    boxShadow: "2px 0 4px rgba(0,0,0,0.05)",
                    backgroundImage: collapsed
                        ? "none"
                        : "linear-gradient(to bottom, #e0f2f1, #b2dfdb)",
                    transition: "width 0.3s ease",
                },
                fontFamily: sizeConfigs.sidebar.font.fontFamily,
                fontWeight: sizeConfigs.sidebar.font.fontWeight,
            }}
        >
            <List disablePadding>
                <Toolbar
                    sx={{
                        mb: "10px",
                        px: 2,
                        backgroundColor: "transparent",
                        justifyContent: "space-between",
                        display: "flex",
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                    >
                        {!collapsed && <Avatar src={assets.images.logo} />}
                    </Stack>

                    <Tooltip title={collapsed ? "Expand" : "Collapse"}>
                        <IconButton onClick={() => setCollapsed(!collapsed)} edge="end">
                            {collapsed ? <ChevronRight /> : <ChevronLeft />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>

                {mainLayout.map((route, index) =>
                    route.props ? (
                        route.child ? (
                            <SidebarItemCollapse
                                item={route}
                                key={index}
                            />
                        ) : (
                            <SidebarItem item={route} key={index} />
                        )
                    ) : null
                )}
            </List>
        </Drawer>
    );
};

export default Sidebar;


