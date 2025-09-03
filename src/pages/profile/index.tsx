/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import {
    Box,
    Container,
    Grid,
    useMediaQuery,
    useTheme,
    alpha
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { useParams } from "react-router";
import UserUtils from "../users/utils";
import ModalComponent from "../../components/modal";
import ChangePassword from "./ChangePassword";
import LeaveComponent from "./Leave";
import UpdateProfileImage from "./UpdateProfileImage";
import UpdateUsers from "../users/UpdateUsers";
import AppBarUtills, { modalStates } from "../../components/appBar/utills";
import RoutesUtills from "../../core/routes/utills";
import { crudStates } from "../../utils/constants";
import MaleProfile from "../../statics/images/male.jpg";
import FemaleProfile from "../../statics/images/Female.jpg";
import UserHeader from "./UserHeader";
import UserInfoCard from "./UserInfoCard";
import WorkInfoCard from "./WorkInfoCard";
import AccountInfoCard from "./AccountInfoCard";

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const { id } = useParams<{ id: string | undefined }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { handleClose, modalState, open, handleOptionClicked } = AppBarUtills();
    const { getCurrentUser } = RoutesUtills();
    const [image, setImage] = useState<string>('');
    const { open: formOpen, handleClose: formHandleClose, modalState: formModalState, setModalState: formSetModalState, handleOpen: formHandleOpen } = UserUtils();

    const getUserDetails = async () => {
        // Implement user fetching logic here
        // For now, we'll use the user context
    };

    useEffect(() => {
        getUserDetails();
    }, [id]);

    // For now, determine profile image based on gender
    const userImage = image || (user?.profileImage || (user?.gender === 'male' ? MaleProfile : FemaleProfile));
    const isCurrentUser = getCurrentUser()?.id === parseInt(id as string, 10);

    return (
        <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
            {/* Modals */}
            {modalState === modalStates.password && (
                <ModalComponent title='Change Password' open={open} handleClose={handleClose} width="70%">
                    <ChangePassword handleClose={handleClose} />
                </ModalComponent>
            )}

            {modalState === modalStates.leave && (
                <ModalComponent title='Update Availability' open={open} handleClose={handleClose} width="60%">
                    <LeaveComponent />
                </ModalComponent>
            )}

            {modalState === modalStates.image && (
                <ModalComponent title='Update Profile Picture' open={open} handleClose={handleClose} width="40%">
                    <UpdateProfileImage setImage={setImage} userImage={userImage} />
                </ModalComponent>
            )}

            {formModalState === crudStates.update && (
                <ModalComponent title='Update Personal Information' open={formOpen} handleClose={formHandleClose} width="70%">
                    <UpdateUsers
                        handleClose={formHandleClose}
                        sendingRequest={false}
                        setSendingRequest={() => { }}
                        user={user}
                    />
                </ModalComponent>
            )}

            {/* User profile header */}
            <UserHeader
                user={user}
                userImage={userImage}
                isCurrentUser={isCurrentUser}
                onUpdateImage={() => handleOptionClicked(modalStates.image)}
                onUpdateAvailability={() => handleOptionClicked(modalStates.leave)}
                onChangePassword={() => handleOptionClicked(modalStates.password)}
            />

            {/* User information cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Personal Information */}
                <Grid item xs={12} md={4}>
                    <UserInfoCard
                        user={user}
                        isCurrentUser={isCurrentUser}
                        onUpdateProfile={() => {
                            formSetModalState(crudStates.update);
                            formHandleOpen();
                        }}
                    />
                </Grid>

                {/* Work Information */}
                <Grid item xs={12} md={4}>
                    <WorkInfoCard user={user} />
                </Grid>

                {/* Account Information */}
                <Grid item xs={12} md={4}>
                    <AccountInfoCard user={user} />
                </Grid>
            </Grid>
        </Container>
    );
}

export default Profile;