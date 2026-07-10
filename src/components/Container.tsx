/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, styled } from "@mui/material";
import { ReactNode } from "react";

/**
 * Full-viewport wrapper for the authentication pages (Login / Password Reset).
 *
 * Follows the MUI sign-in/up template treatment: content centred in a column,
 * with a soft radial-gradient wash painted by a ::before pseudo-element —
 * tinted with Pride Bank's teal instead of the template's blue.
 */
const FullScreenWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100dvh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflowY: "auto",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
    },
    "&::before": {
        content: '""',
        display: "block",
        position: "absolute",
        zIndex: -1,
        inset: 0,
        backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(172, 55%, 94%), hsl(0, 0%, 100%))",
        backgroundRepeat: "no-repeat",
    },
}));

export default function AuthenticationContainerComponent({ children }: { children: ReactNode }) {
    return <FullScreenWrapper>{children}</FullScreenWrapper>;
}
