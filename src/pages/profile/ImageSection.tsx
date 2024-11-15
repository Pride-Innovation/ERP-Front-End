import { Box, Chip, Grid, IconButton, Stack } from '@mui/material'
import MaleProfile from "../../statics/images/male.jpg";
import FemaleProfile from "../../statics/images/Female.jpg";
import { TypographyComponent } from '../../components/headers/TypographyComponent';
import { blue, grey } from '@mui/material/colors';
import ButtonComponent from '../../components/forms/Button';
import EditIcon from '@mui/icons-material/Edit';
import React, { useContext, useRef, useState } from 'react';
import { camelCaseToWords } from '../../utils/helpers';
import { availability, crudStates } from '../../utils/constants';
import AppBarUtills, { modalStates } from '../../components/appBar/utills';
import ModalComponent from '../../components/modal';
import ChangePassword from './ChangePassword';
import LeaveComponent from './Leave';
import InputFileUpload from '../../components/forms/FileUpload';
import UpdateUsers from '../users/UpdateUsers';
import UserUtils from '../users/utils';
// import RoutesUtills from '../../core/routes/utills';
import { IUser } from '../users/interface';
import { UserContext } from '../../context/user/UserContext';
import { usersMock } from '../../mocks/users';

export const ImageSection = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string>("")
    // const { getCurrentUser } = RoutesUtills();

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];
        setImage(URL.createObjectURL(file));
    }

    const {
        handleClose,
        modalState,
        open,
        handleOptionClicked,
    } = AppBarUtills();


    return (
        <Grid
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
            xs container>
            {modalState === modalStates.password &&
                <ModalComponent title='Change Password' open={open} handleClose={handleClose} width="40%">
                    <ChangePassword handleClose={handleClose} />
                </ModalComponent>
            }
            {modalState === modalStates.leave &&
                <ModalComponent title='Request for Leave' open={open} handleClose={handleClose} width="40%">
                    <LeaveComponent />
                </ModalComponent>
            }
            <Box sx={{ position: "relative" }}>
                <Box
                    component="img"
                    sx={{ width: 150, height: 150 }}
                    src={image ? image : usersMock[0].gender === "Male" ? MaleProfile : FemaleProfile}
                />
                <IconButton onClick={handleButtonClick} sx={{ position: "relative", bgcolor: blue[700] }}>
                    <EditIcon fontSize='medium' sx={{ color: "white" }} />
                    <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
                </IconButton>
            </Box>
            <TypographyComponent weight={600} size='18px' sx={{ mt: 2 }}>
                {usersMock[0].firstName + " " + usersMock[0].lastName + " " + usersMock[0].otherName}
            </TypographyComponent>
            <TypographyComponent weight={400} size='14px' sx={{ m: 0.5 }} color={grey[600]} >
                {usersMock[0].title}
            </TypographyComponent>
            <Stack direction="column" spacing={1.5}>
                <ButtonComponent
                    handleClick={() => handleOptionClicked(modalStates.password)}
                    sendingRequest={false}
                    buttonText='Change Password'
                    variant='outlined'
                    buttonColor='info'
                    type='button' />
                <ButtonComponent
                    handleClick={() => handleOptionClicked(modalStates.leave)}
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
    // const { getCurrentUser } = RoutesUtills();
    const { setUser } = useContext(UserContext);

    const { id, role, ...data } = usersMock[0] as IUser;
    const { open, handleClose, modalState, setModalState, handleOpen } = UserUtils();

    const handleProfileUpdate = () => {
        setModalState(crudStates.update)
        setUser(usersMock[0])
        handleOpen();
    }

    return (
        <Grid container xs={12} spacing={1}>
            {modalState === crudStates.update &&
                <ModalComponent title='Update Personal Information' open={open} handleClose={handleClose} width="60%">
                    <UpdateUsers handleClose={handleClose} />
                </ModalComponent>
            }
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
                                <Chip size='small' label={availability.available} color="success" />
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
                        handleClick={handleProfileUpdate}
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