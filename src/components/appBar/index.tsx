/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router';
import { CSSObject, Divider, IconButton, styled, Theme } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from "../../statics/images/NavLogo-removebg-preview.png";
import SideBar from './SideBar';
import NavBar from './NavBar';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 10px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 10px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
        border: 'none',
    }),
);

interface Props { window?: () => Window; }

export default function ApplicationDrawer({ window }: Props) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleDrawerToggle = () => { setMobileOpen(!mobileOpen) };

    const handleDrawerOpen = () => { setDrawerOpen(true); };
    const handleDrawerClose = () => { setDrawerOpen(false); };

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                open={drawerOpen}
                sx={{
                    background: 'linear-gradient(135deg, #08796C 0%, #065E54 100%)',
                    borderBottom: 'none',
                    boxShadow: '0 2px 12px rgba(8, 121, 108, 0.25)',
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 60, sm: 64 } }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: { sm: 'none' },
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box
                        src={Logo}
                        sx={{
                            height: '44px',
                            width: "44px",
                            mr: '14px',
                            display: { xs: 'none', md: 'flex' },
                            borderRadius: "8px",
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                        component='img'
                    />
                    <Typography
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: 0.8,
                            textTransform: 'uppercase',
                        }}
                    >
                        <span style={{ color: "#F0B429", fontWeight: 800 }}>ASSETS</span>
                        {' '}MANAGEMENT
                    </Typography>
                    <NavBar />
                </Toolbar>
            </AppBar>
            <MuiDrawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        background: 'linear-gradient(180deg, #08796C 0%, #065E54 100%)',
                        color: 'white',
                        borderRight: 'none',
                        boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
                    },
                }}
            >
                <DrawerHeader sx={{ bgcolor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
                <Box p={1} sx={{ height: '100%', bgcolor: 'transparent' }}>
                    <SideBar drawerOpen={true} />
                </Box>
            </MuiDrawer>
            <Drawer
                onMouseEnter={handleDrawerOpen}
                onMouseLeave={handleDrawerClose}
                variant="permanent"
                open={drawerOpen}
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        border: 'none',
                        background: 'linear-gradient(180deg, #08796C 0%, #065E54 100%)',
                        color: 'white',
                        boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
                    },
                }}
            >
                <DrawerHeader sx={{ bgcolor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
                <Box p={1} sx={{ height: '100%', bgcolor: 'transparent' }}>
                    <SideBar drawerOpen={drawerOpen} />
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={() => ({
                    flexGrow: 1,
                    height: '100vh',
                    bgcolor: "#F1F5FB",
                    overflowX: 'auto',
                    overflowY: 'auto',
                })}
            >
                <DrawerHeader />
                <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, minHeight: 'calc(100vh - 64px)' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
