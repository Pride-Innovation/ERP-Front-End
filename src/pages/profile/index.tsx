/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Card, Grid } from "@mui/material"
import { ImageSection, ProfileLine } from "./ImageSection";

const Profile = () => {
    return (
        <Grid container xs={12} spacing={3}>
            <Grid item xs={12} md={5}>
                <Card sx={{ py: 3, width: "100%" }}>
                    <ImageSection />
                </Card>
            </Grid>
            <Grid item xs={12} md={7}>
                <Card sx={{ p: 3, width: "100%" }}>
                    <ProfileLine />
                </Card>
            </Grid>
        </Grid>
    )
}

export default Profile;