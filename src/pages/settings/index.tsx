/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Stack, Typography } from "@mui/material"
import { Outlet, useLocation, useNavigate } from "react-router";
import { ISettingsNavigation } from "./interface";
import { useEffect, useState } from "react";
import SettingsUtills from "./utills";

const Settings = () => {
    const [path, setPath] = useState<string>("");
    const { pathname } = useLocation();
    const { navigations } = SettingsUtills();
    const navigate = useNavigate();

    useEffect(() => { setPath(pathname) }, [pathname])

    const determineActivePath = (item: ISettingsNavigation): boolean => {
        if (path === `${item.path}`) return true;
        return false;
    }

    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: "90%", display: "flex" }} py={4}>
                <Box sx={{ width: "20%", mr: 3 }}>
                    <Typography sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: '17px' }}>System Settings</Typography>
                    <Box sx={{ mt: 6 }}>
                        <Stack direction="column" spacing={1}>
                            {navigations.map(item => (
                                <>
                                    <Button
                                        startIcon={item.icon}
                                        onClick={() => navigate(item.path)}
                                        key={item.id}
                                        sx={{ textTransform: "capitalize", display: "flex", justifyContent: "flex-start" }}
                                        variant={determineActivePath(item) ? "contained" : "text"}
                                    >
                                        {item.text}
                                    </Button>
                                </>
                            ))}
                        </Stack>
                    </Box>
                </Box>
                <Box sx={{ width: "80%" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}

export default Settings