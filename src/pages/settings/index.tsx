/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Divider, Stack, Typography, useTheme, Paper } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ISettingsNavigation } from "./interface";
import SettingsUtills from "./utills";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

const Settings = () => {
    const [path, setPath] = useState<string>("");
    const { pathname } = useLocation();
    const { navigations } = SettingsUtills();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        setPath(pathname);
    }, [pathname]);

    const isActive = (item: ISettingsNavigation): boolean => path === item.path;

    return (
        <Paper
            elevation={3}
            sx={{
                width: "100%",
                minHeight: "85vh",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "none"
            }}
        >
            <Box
                sx={{
                    width: { xs: "100%", md: "250px" },
                    bgcolor: theme.palette.grey[100],
                    borderRight: { md: `1px solid ${theme.palette.divider}` },
                    p: 3,
                }}
            >
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        mb: 2,
                        color: theme.palette.secondary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <SettingsOutlinedIcon fontSize="medium" sx={{ color: theme.palette.secondary.main, ml: "10px" }} />
                    System Settings
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1}>
                    {navigations.map((item) => (
                        <Button
                            key={item.id}
                            startIcon={item.icon}
                            onClick={() => navigate(item.path)}
                            variant={isActive(item) ? "contained" : "text"}
                            fullWidth
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "capitalize",
                                borderRadius: 2,
                                fontWeight: isActive(item) ? 600 : 500,
                                color: isActive(item)
                                    ? theme.palette.common.white
                                    : theme.palette.text.primary,
                                bgcolor: isActive(item)
                                    ? theme.palette.primary.main
                                    : "transparent",
                                "&:hover": {
                                    bgcolor: isActive(item)
                                        ? theme.palette.primary.dark
                                        : theme.palette.action.hover,
                                },
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}
                </Stack>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    p: 4,
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Outlet />
            </Box>
        </Paper>
    );
};

export default Settings;