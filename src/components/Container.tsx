import { Grid, styled, Box } from "@mui/material";
import { ReactNode } from "react";
import BackgroundImage from "../statics/images/cloud.560e38e799908a8a535a.jpg";

const FullScreenWrapper = styled(Box)(({ theme }) => ({
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${BackgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflowY: "auto",
    padding: theme.spacing(2),
}));

export default function AuthenticationContainerComponent({ children }: { children: ReactNode }) {
    return (
        <FullScreenWrapper>
            <Grid
                container
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                    maxWidth: '960px',
                    width: '100%',
                    overflow: 'hidden',
                }}
            >
                {children}
            </Grid>
        </FullScreenWrapper>
    );
}