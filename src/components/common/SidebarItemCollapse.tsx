import { useEffect, useState } from "react"
import { RouteType } from "../../routes/config"
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import colorConfigs from "../../configs/colorConfigs"
import { ExpandLessOutlined, ExpandMoreOutlined } from "@mui/icons-material"
import SidebarItem from './SidebarItem'
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"

type Props = {
    item: RouteType
}

const SidebarItemCollapse = ({ item }: Props) => {
    const [open, setOpen] = useState<boolean>(true)
    const { appState } = useSelector((state: RootState) => state.appState)

    useEffect(() => {
        if (appState.includes(item.state)) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [appState, item])

    return (
        item.props && item.path ? (
            <>
                <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={() => setOpen(!open)}
                    sx={{
                        "&:hover": {
                            backgroundColor: colorConfigs.sidebar.hoverBg,
                            transform: "scale(1.05)"
                        },
                        // paddingY: "12px",
                        paddingX: "24px",
                        display: "flex",
                        transition: "background-color 0.2s ease-in-out, transform 0.2s ease-in-out",
                        borderRadius: "8px",
                    }}

                >
                    {item.props.icon && <ListItemIcon
                        sx={{
                            color: colorConfigs.sidebar.color
                        }}
                    >
                        {item.props.icon}
                    </ListItemIcon>}
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography>
                                {item.props.displayText}
                            </Typography>
                        }
                    >
                    </ListItemText>
                    {open ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                </ListItemButton>
                <Collapse in={open} timeout="auto">
                    <List>
                        {item.child?.map((route, index) => (
                            route.props ? (
                                route.child ? (
                                    <SidebarItemCollapse item={route} key={index} />
                                ) : (
                                    <SidebarItem item={route} key={index} />
                                )
                            ) : null))}
                    </List>
                </Collapse>
            </>

        ) : null
    )
}

export default SidebarItemCollapse
