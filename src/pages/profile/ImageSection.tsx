import { Box, Chip, Grid, IconButton, Stack } from '@mui/material'
import MaleProfile from "../../statics/images/male.jpg";
import FemaleProfile from "../../statics/images/Female.jpg";
import { TypographyComponent } from '../../components/headers/TypographyComponent';
import { blue, grey } from '@mui/material/colors';
import ButtonComponent from '../../components/forms/Button';
import EditIcon from '@mui/icons-material/Edit';
import React, { useContext, useEffect } from 'react';
import { usersMock } from '../../mocks/users';
import { UserContext } from '../../context/UserContext';
import { camelCaseToWords } from '../../utils/helpers';
import { availability } from '../../utils/constants';

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
                    buttonText='Change Password'
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
                Object.entries({
                    ...data,
                    availability: data.availability ? availability.available : availability.on_leave
                }).map(([key, value]) => (
                    <React.Fragment>
                        <Grid item xs={4} sx={{ fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {camelCaseToWords(key)}
                        </Grid>
                        <Grid item xs={8} sx={{ fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {value === availability.available ? (
                                <Chip size='small' label={availability.available} color="primary" variant="outlined" />
                            ) : value === availability.on_leave ? (
                                <Chip size='small' label={availability.on_leave} color="error" variant="outlined" />
                            ) : value}
                        </Grid>
                    </React.Fragment>
                ))
            }

            <Box sx={{ width: "100%", mt: 1, display: "flex", justifyContent: "end" }}>
                <Box>
                    <ButtonComponent
                        sendingRequest={false}
                        buttonText='Update Profile'
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>
            </Box>
        </Grid>
    )
}