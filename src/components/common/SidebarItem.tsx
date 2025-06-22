import { RouteType } from "../../routes/config"
import { ListItemButton, ListItemIcon } from "@mui/material"
import { Link } from "react-router-dom"
import colorConfigs from "../../configs/colorConfigs"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"

type Props = {
    item: RouteType
}

const SidebarItem = ({ item }: Props) => {
    const { appState } = useSelector((state: RootState) => state.appState)
    return (
        item.props && item.path ? (
            <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                    display: "flex",
                    mx: "5%",
                    justifyContent: "center",
                    borderRadius: "8px",
                    backgroundColor: appState === item.state
                        ? colorConfigs.sidebar.activeBg
                        : "unset",
                    transition: "background-color 0.2s ease-in-out, transform 0.2s ease-in-out",
                    "&:hover": {
                        backgroundColor: colorConfigs.sidebar.hoverBg,
                        transform: "scale(1.05)"
                    }
                }}
            >
                {item.props.icon && <ListItemIcon
                    sx={{
                        color: colorConfigs.sidebar.color
                    }}
                >
                    {item.props.icon}
                </ListItemIcon>}
                {item.props.displayText}
            </ListItemButton >

        ) : null
    )
}

export default SidebarItem
