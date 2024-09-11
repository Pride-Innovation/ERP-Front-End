import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { sideBarItems } from './sideBarElements';
import { Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { blue } from '@mui/material/colors';
import HandleRoutes from './HandleRoutes';

const drawerWidth = 250;

export default function ApplicationDrawer() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const {
        handleClick,
        expandedItemId,
        activeRoute,
        handleRouteChange
    } = HandleRoutes();

    useEffect(() => { handleRouteChange(pathname) }, [pathname])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Pride Microfinance
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List
                        sx={{ width: '100%', maxWidth: drawerWidth, bgcolor: 'background.paper' }}
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
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={(theme) => ({ flexGrow: 1, p: 3, bgcolor: theme.palette.background.paper, height: '100vh' })}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
