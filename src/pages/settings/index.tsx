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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        gap: 1
                    }}
                >
                    <SettingsOutlinedIcon fontSize="small" />
                    System Settings
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            <Divider sx={{ opacity: 0.6 }} />

            <Box sx={{ p: 2 }}>
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
                                borderRadius: 1.5,
                                py: 1.2,
                                px: 2,
                                fontWeight: isActive(item) ? 600 : 500,
                                color: isActive(item)
                                    ? theme.palette.common.white
                                    : theme.palette.text.primary,
                                bgcolor: isActive(item)
                                    ? theme.palette.primary.main
                                    : "transparent",
                                boxShadow: isActive(item)
                                    ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                                    : 'none',
                                "&:hover": {
                                    bgcolor: isActive(item)
                                        ? theme.palette.primary.dark
                                        : alpha(theme.palette.primary.main, 0.05),
                                },
                                transition: 'all 0.2s ease',
                                "& .MuiButton-startIcon": {
                                    color: isActive(item)
                                        ? theme.palette.common.white
                                        : theme.palette.primary.main,
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
        <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    minHeight: "85vh",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                }}
            >
                {/* Mobile header */}
                {isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} color="primary">
                            Settings
                        </Typography>
                        <IconButton onClick={handleDrawerToggle} edge="end">
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
                            keepMounted: true, // Better mobile performance
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
                            bgcolor: theme.palette.background.paper,
                            borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
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
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        position: 'relative',
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Paper>
        </Container>
    );
};

export default Settings;