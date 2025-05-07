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
import Logo from "../../statics/images/logo.png";
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
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
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
        border: 'none'
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
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="primary"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box
                        src={Logo}
                        sx={{ height: '40px', width: "50px", mr: '20px', display: { xs: 'none', md: 'block' } }}
                        component='img'
                    />
                    <Typography sx={{
                        display: { xs: 'none', md: 'block' },
                        fontSize: '15px', fontWeight: 'bold'
                    }} component="div">
                        Pride Microfinance (MDI) - ERP
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
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                <DrawerHeader />
                <Divider />
                <Box p={1} sx={(theme) => ({ height: '100%', bgcolor: theme.palette.grey[50] })}>
                    <SideBar />
                </Box>
            </MuiDrawer>
            <Drawer
                onMouseEnter={handleDrawerOpen}
                onMouseLeave={handleDrawerClose}
                variant="permanent"
                open={drawerOpen}
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { border: 'none' },
                }}
            >
                <DrawerHeader />
                <Divider />
                <Box p={1} sx={(theme) => ({ height: '100%', bgcolor: theme.palette.grey[50] })}>
                    <SideBar />
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={(theme) => ({ flexGrow: 1, height: '100vh', bgcolor: theme.palette.grey[50], overflowX: 'auto' })}>
                <DrawerHeader />
                <Box sx={{ px: 3, my: 2 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
