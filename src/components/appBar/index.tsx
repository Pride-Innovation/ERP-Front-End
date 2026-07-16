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
import { Outlet } from 'react-router';
import {
    alpha,
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
import LogoMark from '../../statics/images/logo.png';
import { brand, neutral, border, surface } from '../../utils/tokens';
import SideBar from './SideBar';
import NavBar from './NavBar';

const drawerWidth = 248;
const collapsedWidth = 64;

/**
 * One header height shared by the AppBar toolbar, the drawer's brand header and the
 * content offset — previously the drawer used MUI's default toolbar mixin (56/64) while
 * the AppBar was forced to 52/56, so their bottom borders visibly misaligned.
 */
const HEADER_HEIGHT = { xs: 56, sm: 64 };

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
    padding: theme.spacing(0, 1),
    minHeight: HEADER_HEIGHT.xs,
    [theme.breakpoints.up('sm')]: { minHeight: HEADER_HEIGHT.sm },
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

/** Brand block at the top of the drawer: full horizontal logo open, compact mark collapsed. */
const DrawerBrand = ({ open }: { open: boolean }) => (
    <DrawerHeader
        sx={{
            borderBottom: `1px solid ${border.subtle}`,
            justifyContent: 'center',
            px: open ? 2 : 0.5,
            flexShrink: 0,
            overflow: 'hidden',
        }}
    >
        {open ? (
            <Box
                component="img"
                src={Logo}
                alt="Pride Bank"
                sx={{ height: 36, maxWidth: '100%', objectFit: 'contain' }}
            />
        ) : (
            <Box
                component="img"
                src={LogoMark}
                alt="Pride Bank"
                sx={{ height: 36, width: 36, objectFit: 'contain' }}
            />
        )}
    </DrawerHeader>
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
                <Toolbar sx={{ minHeight: HEADER_HEIGHT }}>
                    <IconButton
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 1,
                            display: { sm: 'none' },
                            width: 38,
                            height: 38,
                            bgcolor: neutral[100],
                            border: `1px solid ${neutral[200]}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: alpha(brand[500], 0.08),
                                borderColor: alpha(brand[500], 0.3),
                                '& svg': { color: brand[600] },
                            },
                        }}
                    >
                        <MenuIcon sx={{ color: neutral[600], fontSize: '1.25rem', transition: 'color 0.2s ease' }} />
                    </IconButton>
                    <NavBar />
                </Toolbar>
            </AppBar>

            {/* Floating collapse toggle pinned on the drawer's right border */}
            <Tooltip title={drawerOpen ? 'Collapse sidebar' : 'Expand sidebar'} placement="right">
                <IconButton
                    aria-label="toggle sidebar"
                    onClick={handleSidebarToggle}
                    sx={(theme) => ({
                        position: 'fixed',
                        top: { xs: HEADER_HEIGHT.xs - 14, sm: HEADER_HEIGHT.sm - 14 },
                        left: (drawerOpen ? drawerWidth : collapsedWidth) - 14,
                        zIndex: theme.zIndex.drawer + 2,
                        display: { xs: 'none', sm: 'inline-flex' },
                        width: 28,
                        height: 28,
                        bgcolor: surface.card,
                        color: neutral[500],
                        border: `1px solid ${border.subtle}`,
                        boxShadow: `0 2px 6px ${alpha('#000', 0.08)}`,
                        transition: theme.transitions.create(['left'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        '&:hover': {
                            bgcolor: surface.card,
                            color: brand[600],
                            borderColor: alpha(brand[500], 0.4),
                        },
                    })}
                >
                    {drawerOpen
                        ? <ChevronLeftIcon sx={{ fontSize: 18 }} />
                        : <ChevronRightIcon sx={{ fontSize: 18 }} />}
                </IconButton>
            </Tooltip>

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
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <DrawerBrand open={true} />
                <Box sx={{ flex: 1, minHeight: 0 }}>
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
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <DrawerBrand open={drawerOpen} />
                <Box sx={{ flex: 1, minHeight: 0 }}>
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
                <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 1.5, sm: 2 }, minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
