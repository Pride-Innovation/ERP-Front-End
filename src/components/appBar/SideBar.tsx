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
    Tooltip,
    alpha,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation } from 'react-router';
import { brand, neutral } from '../../utils/tokens';
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
                height: '100%',
                bgcolor: 'transparent',
                position: 'relative',
                borderRadius: 0,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                border: 'none',
            }}
        >
            <List
                sx={{ width: '100%', bgcolor: 'transparent', padding: 0, pt: 1 }}
                component="nav"
            >
                {sideBarList.map((item) => {
                    if (!item.access) return null;

                    const isActive = activeRoute === item.id;

                    const button = (
                        <ListItemButton
                            sx={{
                                position: 'relative',
                                bgcolor: isActive ? alpha(brand[500], 0.08) : 'transparent',
                                color: isActive ? brand[700] : neutral[700],
                                borderRadius: 1.5,
                                mx: 1,
                                my: 0.25,
                                px: drawerOpen ? 1.75 : 1.25,
                                py: 0.75,
                                justifyContent: drawerOpen ? 'flex-start' : 'center',
                                minHeight: 38,
                                fontWeight: isActive ? 600 : 500,
                                transition: 'background-color 0.15s ease, color 0.15s ease',
                                '&:hover': {
                                    bgcolor: isActive ? alpha(brand[500], 0.12) : neutral[100],
                                    color: isActive ? brand[700] : neutral[900],
                                },
                                // 3px brand bar on the left edge when active
                                '&::before': isActive
                                    ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: -4,
                                        top: 6,
                                        bottom: 6,
                                        width: 3,
                                        borderRadius: '0 3px 3px 0',
                                        bgcolor: brand[500],
                                    }
                                    : undefined,
                            }}
                            onClick={() => handleClick(item)}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? brand[600] : neutral[500],
                                    minWidth: 0,
                                    mr: drawerOpen ? 1.5 : 0,
                                    justifyContent: 'center',
                                    transition: 'color 0.15s ease, margin 0.2s ease',
                                }}
                            >
                                {React.cloneElement(item.icon, { fontSize: 'small' })}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{
                                    fontSize: '0.84rem',
                                    fontWeight: isActive ? 600 : 500,
                                    letterSpacing: 0.1,
                                }}
                                sx={{
                                    opacity: drawerOpen ? 1 : 0,
                                    transition: 'opacity 0.15s ease, max-width 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    maxWidth: drawerOpen ? 180 : 0,
                                    color: 'inherit',
                                    m: 0,
                                }}
                            />

                            {item.subroutes.length > 0 && drawerOpen && (
                                expandedItemId === item.id
                                    ? <ExpandLess sx={{ color: neutral[400] }} fontSize="small" />
                                    : <ExpandMore sx={{ color: neutral[400] }} fontSize="small" />
                            )}
                        </ListItemButton>
                    );

                    return (
                        <React.Fragment key={item.id}>
                            {drawerOpen ? (
                                button
                            ) : (
                                <Tooltip title={item.name} placement="right" arrow>
                                    {button}
                                </Tooltip>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
        </Card>
    );
};

export default SideBar;
