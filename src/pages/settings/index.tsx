/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Card, Divider, Stack, Typography, useTheme } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { ISettingsNavigation } from "./interface";
import SettingsUtills from "./utills";

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
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "85vh", bgcolor: theme.palette.background.default, py: 4 }}>
            <Box sx={{ width: "90%", display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>

                {/* Sidebar Card */}
                <Card
                    elevation={1}
                    sx={{
                        width: { xs: "100%", md: "280px" },
                        p: 3,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        bgcolor: theme.palette.background.paper,
                    }}
                >
                    <Typography
                        variant="h6"
                        color="secondary"
                        sx={{ fontWeight: 700, textTransform: "uppercase", fontSize: "16px" }}
                    >
                        System Settings
                    </Typography>

                    <Divider />

                    <Stack spacing={1}>
                        {navigations.map((item) => (
                            <Button
                                key={item.id}
                                startIcon={item.icon}
                                onClick={() => navigate(item.path)}
                                variant={isActive(item) ? "contained" : "text"}
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
                </Card>

                {/* Content Card */}
                <Card
                    elevation={1}
                    sx={{
                        flexGrow: 1,
                        borderRadius: 2,
                        p: 3,
                        bgcolor: theme.palette.background.paper,
                        minHeight: "70vh",
                        overflow: "auto",
                    }}
                >
                    <Outlet />
                </Card>
            </Box>
        </Box>
    );
};

export default Settings;
