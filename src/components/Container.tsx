import { Grid, styled } from "@mui/material";
import { ReactNode } from "react";
import BackgroundImage from "../statics/images/cloud.560e38e799908a8a535a.jpg"

const MyComponent = styled('div')({
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflowY: "auto",
    backgroundImage: `url(${BackgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
});

export default function AuthenticationContainerComponent({ children }: { children: ReactNode }) {
    return (<MyComponent>
        <Grid container xs={12} justifyContent="center">
            {children}
        </Grid>
    </MyComponent>)
}