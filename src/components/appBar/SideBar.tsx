/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useEffect } from 'react';
import {
    Avatar,
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { brand, neutral, border } from '../../utils/tokens';
import { ROUTES } from '../../core/routes/routes';
import RoutesUtills from '../../core/routes/utills';
import MaleLogo from '../../statics/images/male.jpg';
import FemaleLogo from '../../statics/images/Female.jpg';
import HandleRoutes from './HandleRoutes';
import SideBarElements from './sideBarElements';
import { ISideBarItem } from './interface';

interface SideBarProps {
    drawerOpen: boolean;
}

const SideBar = ({ drawerOpen }: SideBarProps) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { sideBarList } = SideBarElements();
    const { activeRoute, handleClick, handleRouteChange } = HandleRoutes();
    const currentUser = RoutesUtills().getCurrentUser();

    useEffect(() => {
        handleRouteChange(pathname);
    }, [pathname]);

    // Preserve item order while sectioning by `group`.
    const groups: Array<{ label: string; items: ISideBarItem[] }> = [];
    sideBarList.forEach((item) => {
        if (!item.access) return;
        const label = item.group ?? '';
        const last = groups[groups.length - 1];
        if (last && last.label === label) last.items.push(item);
        else groups.push({ label, items: [item] });
    });

    const renderItem = (item: ISideBarItem) => {
        const isActive = activeRoute === item.id;

        const button = (
            <ListItemButton
                disableRipple
                sx={{
                    position: 'relative',
                    bgcolor: isActive ? alpha(brand[500], 0.1) : 'transparent',
                    color: isActive ? brand[700] : neutral[700],
                    borderRadius: '10px',
                    mx: drawerOpen ? 1.25 : 1,
                    my: 0.35,
                    px: drawerOpen ? 1.5 : 0,
                    py: 0.85,
                    justifyContent: drawerOpen ? 'flex-start' : 'center',
                    minHeight: 44,
                    transition: 'background-color 0.18s ease, color 0.18s ease',
                    '&:hover': {
                        bgcolor: isActive ? alpha(brand[500], 0.14) : neutral[100],
                        color: isActive ? brand[700] : neutral[900],
                    },
                    '&:hover .MuiListItemIcon-root': {
                        color: isActive ? brand[600] : neutral[700],
                    },
                    // Brand accent bar pinned to the drawer edge when active
                    '&::before': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            left: drawerOpen ? -10 : -8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: 22,
                            width: 3,
                            borderRadius: '0 4px 4px 0',
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
                        transition: 'color 0.18s ease, margin 0.2s ease',
                        '& svg': { fontSize: '1.3rem' },
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
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'transparent',
            }}
        >
            {/* Scrollable nav area with a thin, unobtrusive scrollbar */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: neutral[200], borderRadius: 3 },
                    '&::-webkit-scrollbar-thumb:hover': { bgcolor: neutral[300] },
                    scrollbarWidth: 'thin',
                }}
            >
                <List sx={{ width: '100%', bgcolor: 'transparent', px: 0, pt: 1, pb: 1 }} component="nav">
                    {groups.map((group, gi) => (
                        <React.Fragment key={`${group.label}-${gi}`}>
                            {gi > 0 && !drawerOpen && (
                                <Divider sx={{ mx: 1.5, my: 0.75, borderColor: border.subtle }} />
                            )}
                            {drawerOpen && group.label && (
                                <Typography
                                    sx={{
                                        px: 2.75,
                                        pt: gi === 0 ? 0.75 : 2,
                                        pb: 0.5,
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.09em',
                                        textTransform: 'uppercase',
                                        color: neutral[400],
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {group.label}
                                </Typography>
                            )}
                            {group.items.map(renderItem)}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Footer: mini user card — a shortcut to the profile page */}
            {currentUser && (
                <Box sx={{ borderTop: `1px solid ${border.subtle}`, p: drawerOpen ? 1.25 : 0.75 }}>
                    <Tooltip title={drawerOpen ? '' : `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''} — Profile`} placement="right" arrow>
                        <Box
                            onClick={() => navigate(ROUTES.PROFILE)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: drawerOpen ? 'flex-start' : 'center',
                                gap: drawerOpen ? 1.25 : 0,
                                p: drawerOpen ? 1 : 0.75,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'background-color 0.18s ease',
                                '&:hover': { bgcolor: neutral[100] },
                            }}
                        >
                            <Avatar
                                src={currentUser?.image || (currentUser?.gender === 'male' ? MaleLogo : FemaleLogo)}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    flexShrink: 0,
                                    border: `2px solid ${neutral[0]}`,
                                    boxShadow: `0 0 0 1px ${neutral[200]}`,
                                }}
                            />
                            <Box
                                sx={{
                                    minWidth: 0,
                                    opacity: drawerOpen ? 1 : 0,
                                    maxWidth: drawerOpen ? 170 : 0,
                                    transition: 'opacity 0.15s ease, max-width 0.2s ease',
                                    overflow: 'hidden',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.78rem', fontWeight: 600, color: neutral[800],
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3,
                                    }}
                                >
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.66rem', fontWeight: 500, color: neutral[500],
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3,
                                    }}
                                >
                                    View profile
                                </Typography>
                            </Box>
                        </Box>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );
};

export default SideBar;
