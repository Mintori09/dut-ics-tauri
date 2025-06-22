import { AppBar, Toolbar, Typography } from "@mui/material"
import sizeConfigs from "../../configs/sizeConfigs"
import colorConfigs from "../../configs/colorConfigs"

const Topbar = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${sizeConfigs.sidebar.width})`,
                ml: sizeConfigs.sidebar.width,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                backgroundColor: colorConfigs.topbar.bg,
                color: colorConfigs.topbar.color,
                borderRadius: "8px",
                backgroundImage: "linear-gradient(to right, #f0f4c3, #dce775)"
            }}
        >
            <Toolbar>
                <Typography variant="h6" sx={{
                    fontWeight: "bold",
                    fontSize: "1.2rem"
                }}>
                    React sidebar
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Topbar
