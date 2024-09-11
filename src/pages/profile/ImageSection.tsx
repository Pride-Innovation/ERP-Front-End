import { Box, Grid, IconButton, Stack } from '@mui/material'
import MaleProfile from "../../statics/images/male.jpg";
import FemaleProfile from "../../statics/images/female.webp";
import { TypographyComponent } from '../../components/headers/TypographyComponent';
import { blue, grey } from '@mui/material/colors';
import ButtonComponent from '../../components/forms/Button';
import EditIcon from '@mui/icons-material/Edit';
import React, { useContext, useEffect } from 'react';
import { usersMock } from '../../mocks/users';
import { UserContext } from '../../context/UserContext';
import { camelCaseToWords } from '../../utils/helpers';

export const ImageSection = () => {
    const { user, setUser } = useContext(UserContext);
    useEffect(() => {
        setUser(() => {
            return usersMock[0]
        })
    }, []);

    return (
        <Grid
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
            xs container>
            <Box sx={{ position: "relative" }}>
                <Box
                    component="img"
                    sx={{ width: 130, height: 150 }}
                    src={user.gender === "Male" ? MaleProfile : FemaleProfile}
                />
                <IconButton sx={{ position: "relative", bgcolor: blue[700] }}>
                    <EditIcon fontSize='medium' sx={{ color: "white" }} />
                </IconButton>
            </Box>
            <TypographyComponent weight={600} size='18px' sx={{ mt: 2 }}>
                {user.firstName + " " + user.lastName + " " + user.otherName}
            </TypographyComponent>
            <TypographyComponent weight={400} size='14px' sx={{ m: 0.5 }} color={grey[600]} >
                {user.title}
            </TypographyComponent>
            <Stack direction="column" spacing={1.5}>
                <ButtonComponent
                    sendingRequest={false}
                    buttonText='Update Password'
                    variant='outlined'
                    buttonColor='info'
                    type='button' />
                <ButtonComponent
                    sendingRequest={false}
                    buttonText='Update Availability'
                    variant='contained'
                    buttonColor='info'
                    type='button' />
            </Stack>
        </Grid>
    )
}


export const ProfileLine = () => {
    const { user } = useContext(UserContext);
    const { id, ...data } = user
    return (
        <Grid container xs={12} spacing={1}>
            {
                Object.entries(data).map(([key, value]) => (
                    <React.Fragment>
                        <Grid item xs={4} sx={{ fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {camelCaseToWords(key)}
                        </Grid>
                        <Grid item xs={8} sx={{ fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {value}
                        </Grid>
                    </React.Fragment>
                ))
            }
            
            <Box sx={{ width: "100%", mt: 1 }}>
                <ButtonComponent
                    sendingRequest={false}
                    buttonText='Update Profile'
                    variant='outlined'
                    buttonColor='info'
                    type='button' />
            </Box>
        </Grid>
    )
}