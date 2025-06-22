import { Avatar, Drawer, List, Stack, Toolbar } from "@mui/material"
import sizeConfigs from "../../configs/sizeConfigs"
import assets from "../../assets"
import colorConfigs from "../../configs/colorConfigs"
import { mainLayout } from "../../routes/appRoutes"
import SidebarItem from "./SidebarItem"
import SidebarItemCollapse from "./SidebarItemCollapse"


const Sidebar = () => {

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: sizeConfigs.sidebar.width,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: sizeConfigs.sidebar.width,
                    boxSizing: "border-box",
                    borderRight: "0px",
                    backgroundColor: colorConfigs.sidebar.bg,
                    color: colorConfigs.sidebar.color,
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    backgroundImage: "linear-gradient(to bottom, #e0f2f1, #b2dfdb)",
                },
                fontFamily: sizeConfigs.sidebar.font.fontFamily,
                fontWeight: sizeConfigs.sidebar.font.fontWeight,
            }}
        >
            <List disablePadding>
                <Toolbar sx={{
                    marginBottom: "20px",
                    backgroundColor: "transparent"
                }}>
                    <Stack
                        sx={{ width: "100%" }}
                        direction="row"
                        justifyContent="center"
                    >
                        <Avatar src={assets.images.logo} />
                    </Stack>
                </Toolbar>
                {mainLayout.map((route, index) => (
                    route.props ? (
                        route.child ? (
                            <SidebarItemCollapse item={route} key={index} />
                        ) : (
                            <SidebarItem item={route} key={index} />
                        )
                    ) : null))}
            </List>
        </Drawer>
    )
}

export default Sidebar
