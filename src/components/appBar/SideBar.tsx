/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect } from 'react';
import {
    Card,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation } from 'react-router';
import HandleRoutes from './HandleRoutes';
import SideBarElements from './sideBarElements';

interface SideBarProps {
    drawerOpen: boolean;
}

const SideBar = ({ drawerOpen }: SideBarProps) => {
    const { pathname } = useLocation();
    const { sideBarList } = SideBarElements();
    const { activeRoute, handleClick, expandedItemId, handleRouteChange } = HandleRoutes();

    useEffect(() => {
        handleRouteChange(pathname);
    }, [pathname]);

    return (
        <Card sx={{ height: "100%", bgcolor: 'transparent' }}>
            <List
                sx={{
                    width: "100%",
                    bgcolor: 'transparent',
                    padding: 0,
                }}
                component="nav"
            >
                {sideBarList.map(item => (
                    <React.Fragment key={item.id}>
                        <ListItemButton
                            sx={{
                                bgcolor: activeRoute === item.id ? '#08796C' : 'transparent',
                                color: activeRoute === item.id ? 'white' : 'inherit',
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                                px: drawerOpen ? 2 : 1,
                                justifyContent: drawerOpen ? 'flex-start' : 'center',
                                '&:hover': {
                                    bgcolor: activeRoute === item.id ? '#06675A' : 'rgba(8, 121, 108, 0.08)',
                                    color: activeRoute === item.id ? 'white' : '#08796C',
                                },
                                transition: 'all 0.3s ease', // Smooth transition
                            }}
                            onClick={() => handleClick(item)}
                        >
                            <ListItemIcon
                                sx={{
                                    color: activeRoute === item.id ? 'white' : '#08796C',
                                    minWidth: 0,
                                    mr: drawerOpen ? 2 : 0,
                                    justifyContent: 'center',
                                    transition: 'margin 0.3s ease',
                                }}
                            >
                                {React.cloneElement(item.icon, { fontSize: 'small' })}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.name}
                                sx={{
                                    opacity: drawerOpen ? 1 : 0,
                                    transition: 'opacity 0.3s ease-in-out, margin 0.3s ease-in-out, max-width 0.3s ease-in-out',
                                    whiteSpace: 'nowrap',
                                    ml: drawerOpen ? 1 : 0,
                                    overflow: 'hidden',
                                    maxWidth: drawerOpen ? 200 : 0,
                                  }}
                            />

                            {item.subroutes.length > 0 && drawerOpen && (
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
};

export default SideBar;
