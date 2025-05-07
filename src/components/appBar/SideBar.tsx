import React, { useEffect } from 'react';
import { Card, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { blue } from '@mui/material/colors';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation } from 'react-router';
import HandleRoutes from './HandleRoutes';
import SideBarElements from './sideBarElements';

const SideBar = () => {
    const { pathname } = useLocation();
    const { sideBarList } = SideBarElements();
    const { activeRoute, handleClick, expandedItemId, handleRouteChange } = HandleRoutes();

    useEffect(() => {
        handleRouteChange(pathname);
    }, [pathname]);

    return (
        <Card sx={{ height: "100%" }}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }} component="nav">
                {sideBarList.map(item => (
                    <React.Fragment key={item.id}>
                        <ListItemButton
                            sx={{
                                bgcolor: activeRoute === item.id ? '#08796C' : 'transparent',
                                color: activeRoute === item.id ? 'white' : 'inherit',
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                '&:hover': {
                                    bgcolor: activeRoute === item.id ? '#06675A' : 'rgba(8, 121, 108, 0.08)',
                                    color: activeRoute === item.id ? 'white' : '#08796C',
                                },
                            }}
                            onClick={() => handleClick(item)}
                        >
                            <ListItemIcon sx={{ color: activeRoute === item.id ? 'white' : '#08796C' }}>
                                {React.cloneElement(item.icon, { fontSize: 'small' })}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.name}
                                sx={{
                                    ml: 1,
                                    fontWeight: activeRoute === item.id ? 'bold' : 500,
                                    color: activeRoute === item.id ? 'white' : 'inherit',
                                }}
                            />
                            {item.subroutes.length > 0 && (
                                expandedItemId === item.id
                                    ? <ExpandLess sx={{ color: activeRoute === item.id ? "white" : blue[700] }} fontSize="small" />
                                    : <ExpandMore sx={{ color: activeRoute === item.id ? "white" : blue[700] }} fontSize="small" />
                            )}
                        </ListItemButton>
                    </React.Fragment>
                ))}
            </List>
        </Card>
    );
}

export default SideBar;
