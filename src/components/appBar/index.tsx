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
// import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router';
import {
    CSSObject,
    IconButton,
    styled,
    Theme,
    Tooltip,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Logo from '../../statics/images/pride_logo_horizontal.png';
import { brand, neutral, border, surface } from '../../utils/tokens';
import SideBar from './SideBar';
import NavBar from './NavBar';

const drawerWidth = 248;
const collapsedWidth = 64;

const SIDEBAR_PREF_KEY = 'sidebar:open';

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
    width: collapsedWidth,
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
    ...(!open && {
        marginLeft: collapsedWidth,
        width: `calc(100% - ${collapsedWidth}px)`,
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
    const [drawerOpen, setDrawerOpen] = React.useState<boolean>(() => {
        // Default to OPEN unless the user previously collapsed it.
        const stored = globalThis.localStorage?.getItem(SIDEBAR_PREF_KEY);
        return stored === null || stored === undefined ? true : stored === 'true';
    });

    React.useEffect(() => {
        globalThis.localStorage?.setItem(SIDEBAR_PREF_KEY, String(drawerOpen));
    }, [drawerOpen]);

    const handleDrawerToggle = () => setMobileOpen((v) => !v);
    const handleSidebarToggle = () => setDrawerOpen((v) => !v);

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                open={drawerOpen}
                sx={{
                    background: surface.card,
                    borderBottom: `1px solid ${border.subtle}`,
                    boxShadow: 'none',
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 52, sm: 56 } }}>
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 1,
                            display: { sm: 'none' },
                            color: neutral[700],
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Tooltip title={drawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                        <IconButton
                            aria-label="toggle sidebar"
                            onClick={handleSidebarToggle}
                            sx={{
                                mr: 1,
                                display: { xs: 'none', sm: 'inline-flex' },
                                color: neutral[600],
                                '&:hover': { color: brand[600], bgcolor: neutral[100] },
                            }}
                        >
                            {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </Tooltip>
                    <Box
                        src={Logo}
                        sx={{
                            height: '50px',
                            width: '250px',
                            mr: 1.25,
                            display: { xs: 'none', md: 'flex' },
                            borderRadius: '8px',
                        }}
                        component="img"
                    />
                    {/* <Typography
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            fontSize: '14px',
                            fontWeight: 700,
                            color: neutral[900],
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                        }}
                    >
                        <span style={{ color: brand[500], fontWeight: 800 }}>ASSETS</span>
                        {' '}MANAGEMENT
                    </Typography> */}
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
                        background: surface.card,
                        color: neutral[900],
                        borderRight: `1px solid ${border.subtle}`,
                    },
                }}
            >
                <DrawerHeader sx={{ borderBottom: `1px solid ${border.subtle}` }} />
                <Box p={0.5} sx={{ height: '100%' }}>
                    <SideBar drawerOpen={true} />
                </Box>
            </MuiDrawer>
            <Drawer
                variant="permanent"
                open={drawerOpen}
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        border: 'none',
                        background: surface.card,
                        borderRight: `1px solid ${border.subtle}`,
                        color: neutral[900],
                        boxShadow: 'none',
                    },
                }}
            >
                <DrawerHeader sx={{ borderBottom: `1px solid ${border.subtle}` }} />
                <Box p={0.5} sx={{ height: '100%' }}>
                    <SideBar drawerOpen={drawerOpen} />
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: 0,
                    minHeight: '100vh',
                    bgcolor: surface.page,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}
            >
                <DrawerHeader />
                <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 1.5, sm: 2 }, minHeight: 'calc(100vh - 56px)' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
