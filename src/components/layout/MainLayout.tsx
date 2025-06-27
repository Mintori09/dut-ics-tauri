import { Box, Toolbar } from "@mui/material"
import SideBar from '../common/Sidebar'
import sizeConfigs from "../../configs/sizeConfigs"
import colorConfigs from "../../configs/colorConfigs"
import { Outlet } from "react-router-dom"
import { useState } from "react"

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Box sx={{ display: "flex" }}>
            {/* <Topbar /> */}
            <Box
                component="nav"
                sx={{
                    width: collapsed ? 60 : sizeConfigs.sidebar.width,
                    flexShrink: 0,
                    transition: "width 0.3s ease",
                }}
            >
                <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: `calc(100% - ${sizeConfigs.sidebar.width})`,
                    minHeight: "100vh",
                    backgroundColor: colorConfigs.mainBg
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    )
}

export default MainLayout
