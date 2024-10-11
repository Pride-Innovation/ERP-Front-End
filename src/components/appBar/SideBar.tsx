import {
    Card,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material'
import React from 'react'
import { sideBarItems } from './sideBarElements'
import { blue } from '@mui/material/colors'
import HandleRoutes from './HandleRoutes'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { useNavigate } from 'react-router'

const SideBar = () => {
    const navigate = useNavigate();
    const {
        activeRoute,
        handleClick,
        expandedItemId
    } = HandleRoutes();

    return (

        <Card sx={{ overflow: 'auto' }}>
            <List
                sx={{ width: '100%', bgcolor: 'background.paper' }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >
                {
                    sideBarItems.map(item => (
                        <React.Fragment key={item.id}>
                            <ListItemButton sx={{
                                bgcolor: activeRoute === item.id ? blue[700] : "",
                                '&:hover': {
                                    bgcolor: activeRoute === item.id ? 'primary.dark' : 'action.hover',
                                },
                            }} onClick={() => handleClick(item)}>
                                <ListItemIcon>
                                    {React.cloneElement(item.icon, {
                                        style: { color: activeRoute === item.id ? "white" : "inherit" },
                                    })}
                                </ListItemIcon>
                                <ListItemText sx={{
                                    color: activeRoute === item.id ? "white" : "",
                                    '&:hover': {
                                        color: 'primary.light',
                                    },
                                }} primary={item.name} />
                                {
                                    item.subroutes.length > 0 && (
                                        expandedItemId === item.id
                                            ? <ExpandLess sx={{ color: activeRoute === item.id ? "white" : blue[700] }} fontSize="small" />
                                            : <ExpandMore sx={{ color: activeRoute === item.id ? "white" : blue[700] }} fontSize="small" />
                                    )
                                }
                            </ListItemButton>
                            {item?.subroutes?.length > 0
                                && expandedItemId === item.id
                                && <Collapse in={expandedItemId === item.id} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {
                                            item?.subroutes.map(subroute => (
                                                <ListItemButton key={subroute.id} onClick={() => navigate(subroute.route)} sx={{ pl: 4 }}>
                                                    <ListItemIcon>
                                                        {subroute.icon}
                                                    </ListItemIcon>
                                                    <ListItemText primary={subroute.name} />
                                                </ListItemButton>
                                            ))
                                        }
                                    </List>
                                </Collapse>}
                        </React.Fragment>
                    ))
                }
            </List>
        </Card>
    )
}

export default SideBar