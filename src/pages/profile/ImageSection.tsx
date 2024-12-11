import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Chip, Grid, IconButton, Stack } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';
import { useParams } from 'react-router';
import MaleProfile from "../../statics/images/male.jpg";
import FemaleProfile from "../../statics/images/Female.jpg";
import { camelCaseToWords } from '../../utils/helpers';
import { availability, crudStates } from '../../utils/constants';
import AppBarUtills, { modalStates } from '../../components/appBar/utills';
import ModalComponent from '../../components/modal';
import ChangePassword from './ChangePassword';
import LeaveComponent from './Leave';
import InputFileUpload from '../../components/forms/FileUpload';
import UpdateUsers from '../users/UpdateUsers';
import UserUtils from '../users/utils';
import RoutesUtills from '../../core/routes/utills';
import { UserContext } from '../../context/user/UserContext';
import ButtonComponent from '../../components/forms/Button';
import { TypographyComponent } from '../../components/headers/TypographyComponent';

const ImageSection = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setUser, user } = useContext(UserContext);
    const { id } = useParams<{ id: string | undefined }>();
    const { getSingleUser } = UserUtils();
    const [image, setImage] = useState<string>('');

    const getUserDetails = async () => {
        const response = await getSingleUser(id as string);
        setUser(response);
    };

    useEffect(() => { getUserDetails() }, [id]);

    const handleButtonClick = () => inputRef.current?.click();

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];
        setImage(URL.createObjectURL(file));
    };

    const { getCurrentUser } = RoutesUtills();
    const { handleClose, modalState, open, handleOptionClicked } = AppBarUtills();

    return (
        <Grid container direction="column" alignItems="center" justifyContent="center">
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
                    src={image || (user.gender === 'male' ? MaleProfile : FemaleProfile)}
                />
                {getCurrentUser()?.id === parseInt(id as string, 10) && (
                    <IconButton onClick={handleButtonClick} sx={{ position: "absolute", bgcolor: blue[700] }}>
                        <EditIcon fontSize='medium' sx={{ color: "white" }} />
                        <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
                    </IconButton>
                )}
            </Box>
            <TypographyComponent weight={600} size='18px' sx={{ mt: 2 }}>
                {`${user.firstName} ${user.lastName} ${user.otherName}`}
            </TypographyComponent>
            <TypographyComponent weight={400} size='14px' sx={{ m: 0.5 }} color={grey[600]}>
                {user.title}
            </TypographyComponent>
            <Stack direction="column" spacing={1.5}>
                {getCurrentUser()?.id === parseInt(id as string, 10) && (
                    <ButtonComponent
                        handleClick={() => handleOptionClicked(modalStates.password)}
                        sendingRequest={false}
                        buttonText='Change Password'
                        variant='outlined'
                        buttonColor='info'
                        type='button'
                    />
                )}
                <ButtonComponent
                    handleClick={() => handleOptionClicked(modalStates.leave)}
                    sendingRequest={false}
                    buttonText='Update Availability'
                    variant='contained'
                    buttonColor='info'
                    type='button'
                />
            </Stack>
        </Grid>
    );
};

const ProfileLine = () => {
    const { setUser, user } = useContext(UserContext);
    const { id } = useParams<{ id: string | undefined }>();
    const { getSingleUser } = UserUtils();
    const { getCurrentUser } = RoutesUtills();

    const excludedFields = ['id', 'role', 'image', 'firstName', 'lastName', 'otherName'];
    const { open, handleClose, modalState, setModalState, handleOpen } = UserUtils();

    const getUserDetails = async () => {
        const response = await getSingleUser(id as string);
        setUser(response);
    };

    useEffect(() => { getUserDetails() }, [id]);

    const handleProfileUpdate = () => {
        setModalState(crudStates.update);
        handleOpen();
    };

    return (
        <Grid container xs={12} spacing={1}>
            {modalState === crudStates.update &&
                <ModalComponent title='Update Personal Information' open={open} handleClose={handleClose} width="60%">
                    <UpdateUsers handleClose={handleClose} />
                </ModalComponent>
            }
            {Object.entries({
                ...user,
                availability: user?.availability ? availability.available : availability.on_leave
            })
                .filter(([key]) => !excludedFields.includes(key))
                .map(([key, value]) => (
                    <React.Fragment key={key}>
                        <Grid item xs={4} sx={{ fontWeight: 600, fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {camelCaseToWords(key)}
                        </Grid>
                        <Grid item xs={8} sx={{ fontSize: "14px", borderBottom: `2px solid ${grey[100]}`, py: 0.5 }}>
                            {value === availability.available ? (
                                <Chip size='small' label={availability.available} color="success" />
                            ) : value === availability.on_leave ? (
                                <Chip size='small' label={availability.on_leave} color="error" variant="outlined" />
                            ) : typeof value === 'string' || typeof value === 'number' ? (
                                value
                            ) : (
                                <span>{String(value)}</span>
                            )}
                        </Grid>
                    </React.Fragment>
                ))}
            {getCurrentUser()?.id === parseInt(id as string, 10) && (
                <Box sx={{ width: "100%", mt: 1, display: "flex", justifyContent: "end" }}>
                    <ButtonComponent
                        handleClick={handleProfileUpdate}
                        sendingRequest={false}
                        buttonText='Update Profile'
                        variant='contained'
                        buttonColor='info'
                        type='button'
                    />
                </Box>
            )}
        </Grid>
    );
};

export { ImageSection, ProfileLine };
