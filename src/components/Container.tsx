/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, styled } from "@mui/material";
import { ReactNode } from "react";
import BackgroundImage from "../statics/images/cloud.560e38e799908a8a535a.jpg";

// Enhanced fullscreen wrapper with animated gradient overlay
const FullScreenWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflowY: "auto",
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(3),
    },

    // Base background
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "brightness(0.85)",
        zIndex: -2
    },

    // Animated gradient overlay
    "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, 
                     rgba(0,0,0,0.8) 0%, 
                     rgba(8,121,108,0.65) 50%,
                     rgba(0,0,0,0.75) 100%)`,
        opacity: 0.95,
        zIndex: -1,
        animation: "gradientShift 15s ease infinite alternate",
    },

    // Keyframes for subtle gradient movement
    "@keyframes gradientShift": {
        "0%": {
            backgroundPosition: "0% 50%"
        },
        "100%": {
            backgroundPosition: "100% 50%"
        }
    }
}));

// Floating particles for visual interest
const Particles = styled(Box)({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: -1,

    "& span": {
        position: "absolute",
        display: "block",
        width: "5px",
        height: "5px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        animation: "float 15s linear infinite"
    },

    "& span:nth-of-type(1)": {
        top: "20%",
        left: "20%",
        animationDelay: "0s",
        width: "60px",
        height: "60px"
    },
    "& span:nth-of-type(2)": {
        top: "60%",
        left: "40%",
        animationDelay: "2s",
        width: "40px",
        height: "40px"
    },
    "& span:nth-of-type(3)": {
        top: "40%",
        left: "80%",
        animationDelay: "4s",
        width: "80px",
        height: "80px"
    },
    "& span:nth-of-type(4)": {
        top: "80%",
        left: "10%",
        animationDelay: "6s",
        width: "50px",
        height: "50px"
    },
    "& span:nth-of-type(5)": {
        top: "10%",
        left: "60%",
        animationDelay: "8s",
        width: "35px",
        height: "35px"
    },

    "@keyframes float": {
        "0%": {
            transform: "translateY(0) rotate(0deg)",
            opacity: 0.2,
        },
        "100%": {
            transform: "translateY(-100vh) rotate(720deg)",
            opacity: 0,
        }
    }
});

export default function AuthenticationContainerComponent({ children }: { children: ReactNode }) {
    return (
        <FullScreenWrapper>
            <Particles>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </Particles>
            {children}
        </FullScreenWrapper>
    );
}