/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
    useTheme,
    Paper,
    alpha,
    useMediaQuery,
    Drawer,
    IconButton,
    Container
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ISettingsNavigation } from "./interface";
import SettingsUtills from "./utills";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const PRIMARY = '#08796C';

const Settings = () => {
    const [path, setPath] = useState<string>("");
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const { pathname } = useLocation();
    const { navigations } = SettingsUtills();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        setPath(pathname);
    }, [pathname]);

    const isActive = (item: ISettingsNavigation): boolean => path === item.path;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navigateToItem = (item: ISettingsNavigation) => {
        navigate(item.path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const sidebar = (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #08796C 0%, #065E53 100%)',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <SettingsOutlinedIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#fff',
                        }}
                    >
                        System Settings
                    </Typography>
                </Stack>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ px: 2, pb: 2, pt: 2 }}>
                <Stack spacing={1}>
                    {navigations.map((item) => (
                        <Button
                            key={item.id}
                            startIcon={item.icon}
                            onClick={() => navigateToItem(item)}
                            variant={isActive(item) ? "contained" : "text"}
                            fullWidth
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                borderRadius: '8px',
                                py: 1,
                                px: 2,
                                fontWeight: isActive(item) ? 600 : 500,
                                fontSize: '0.875rem',
                                color: isActive(item) ? '#fff' : '#334155',
                                bgcolor: isActive(item) ? PRIMARY : 'transparent',
                                boxShadow: isActive(item)
                                    ? `0 2px 8px ${alpha(PRIMARY, 0.3)}`
                                    : 'none',
                                "&:hover": {
                                    bgcolor: isActive(item)
                                        ? '#065E53'
                                        : alpha(PRIMARY, 0.06),
                                },
                                transition: 'all 0.18s ease',
                                "& .MuiButton-startIcon": {
                                    color: isActive(item) ? '#fff' : PRIMARY,
                                }
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: '#F1F5FB', minHeight: '100vh' }}>
            {/* Page gradient header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #08796C 0%, #065E53 60%, #044a42 100%)',
                    px: { xs: 2, md: 4 },
                    pt: 4,
                    pb: 7,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{
                    position: 'absolute', top: -50, right: -30,
                    width: 220, height: 220, borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    pointerEvents: 'none',
                }} />
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: 54, height: 54, borderRadius: '14px',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <SettingsOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 0.25 }}>
                            System Settings
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                            Configure roles, branches, regions, commodities, titles, suppliers & departments
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Main content pulled up to overlap gradient */}
            <Container maxWidth="xl" sx={{ mt: -4, mb: 5, position: 'relative', zIndex: 1, px: { xs: 1, md: 3 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        width: "100%",
                        minHeight: "80vh",
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        borderRadius: 3,
                        overflow: "hidden",
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                        boxShadow: '0 4px 28px rgba(0,0,0,0.09)',
                    }}
                >
                    {/* Mobile header */}
                    {isMobile && (
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #08796C 0%, #065E53 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                            }}
                        >
                            <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                                Settings
                            </Typography>
                            <IconButton onClick={handleDrawerToggle} edge="end" sx={{ color: '#fff' }}>
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    )}

                    {/* Sidebar - desktop version is fixed, mobile is in a drawer */}
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true,
                            }}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                '& .MuiDrawer-paper': {
                                    boxSizing: 'border-box',
                                    width: 280,
                                    borderRadius: '0 8px 8px 0'
                                },
                            }}
                        >
                            {sidebar}
                        </Drawer>
                    ) : (
                        <Box
                            sx={{
                                width: { md: "260px" },
                                bgcolor: '#fff',
                                borderRight: `1px solid ${alpha(PRIMARY, 0.1)}`,
                                display: { xs: 'none', md: 'block' },
                            }}
                        >
                            {sidebar}
                        </Box>
                    )}

                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 2, sm: 3, md: 4 },
                            bgcolor: '#FAFBFE',
                            position: 'relative',
                            overflow: 'auto',
                        }}
                    >
                        <Outlet />
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Settings;