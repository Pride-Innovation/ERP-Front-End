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
        <Card
            elevation={0}
            sx={{
                height: "100%",
                bgcolor: 'transparent',
                position: 'relative',
                borderRadius: 0,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
            }}>
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
                        {item.access &&

                            <ListItemButton
                                sx={{
                                    bgcolor: activeRoute === item.id
                                        ? 'rgba(255,255,255,0.18)'
                                        : 'transparent',
                                    color: 'white',
                                    borderRadius: 2,
                                    mx: 0.5,
                                    my: 0.3,
                                    px: drawerOpen ? 2 : 1.5,
                                    justifyContent: drawerOpen ? 'flex-start' : 'center',
                                    backdropFilter: activeRoute === item.id ? 'blur(6px)' : 'none',
                                    boxShadow: activeRoute === item.id
                                        ? '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
                                        : 'none',
                                    border: activeRoute === item.id
                                        ? '1px solid rgba(255,255,255,0.2)'
                                        : '1px solid transparent',
                                    '&:hover': {
                                        bgcolor: activeRoute === item.id
                                            ? 'rgba(255,255,255,0.22)'
                                            : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                    minHeight: 44,
                                }}
                                onClick={() => handleClick(item)}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: 'rgba(255,255,255,0.9)',
                                        minWidth: 0,
                                        mr: drawerOpen ? 1.5 : 0,
                                        justifyContent: 'center',
                                        transition: 'margin 0.2s ease',
                                        filter: activeRoute === item.id
                                            ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                                            : 'none',
                                    }}
                                >
                                    {React.cloneElement(item.icon, { fontSize: 'small' })}
                                </ListItemIcon>

                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: activeRoute === item.id ? 600 : 400,
                                        letterSpacing: 0.2,
                                    }}
                                    sx={{
                                        opacity: drawerOpen ? 1 : 0,
                                        transition: 'opacity 0.2s ease, max-width 0.2s ease',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        maxWidth: drawerOpen ? 180 : 0,
                                        color: 'white',
                                    }}
                                />

                                {item.subroutes.length > 0 && drawerOpen && (
                                    expandedItemId === item.id
                                        ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.8)' }} fontSize="small" />
                                        : <ExpandMore sx={{ color: 'rgba(255,255,255,0.8)' }} fontSize="small" />
                                )}
                            </ListItemButton>
                        }

                    </React.Fragment>
                ))}
            </List>
        </Card>
    );
};

export default SideBar;
