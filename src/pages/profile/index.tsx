/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import {
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
import { fetchSingleUserService } from "../users/service";
import { IUserAxiosResponse } from "../users/interface";
import { toast } from "react-toastify";
import { removeUserProfileImageService, updateUserProfileImageService } from "./service";


const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const { id } = useParams<{ id: string | undefined }>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { handleClose, modalState, open, handleOptionClicked } = AppBarUtills();
    const { getCurrentUser } = RoutesUtills();
    const [image, setImage] = useState<string>('');
    const {
        open: formOpen,
        handleClose: formHandleClose,
        modalState: formModalState,
        setModalState: formSetModalState,
        handleOpen: formHandleOpen
    } = UserUtils();

    const getUserDetails = async () => {
        try {
            const response = await fetchSingleUserService(id as string) as IUserAxiosResponse;
            if (response.status === 200) {
                // Process the profile image path before setting user data
                const userData = response.data;
                if (userData.profileImage) {
                    // Extract just the filename from the absolute path
                    const filename = userData.profileImage.split(/[\/\\]/).pop();
                    if (filename) {
                        userData.profileImage = `/statics/${filename}`;
                    }
                }
                setUser(userData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getUserDetails();
    }, [id]);

    const userImage = image || (user?.profileImage || (user?.gender === 'male' ? MaleProfile : FemaleProfile));
    const isCurrentUser = getCurrentUser()?.id === parseInt(id as string, 10);


    const handleProfileImageUpdate = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await updateUserProfileImageService(id as string, formData);
            if (response.status !== 201) {
                toast.error('Failed to update profile image');
            }

            if (response.data && response.data.profileImage) {
                const serverPath = response.data.profileImage;
                const filename = serverPath.split(/[\/\\]/).pop();

                setUser({
                    ...user,
                    profileImage: `/statics/${filename}`
                });

                toast.success('Profile image updated successfully');
            } else {
                toast.error('Failed to update profile image');
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
            toast.error('Failed to update profile image');
            throw error;
        }
    };

    const handleProfileImageRemove = async () => {
        try {
            const response = await removeUserProfileImageService(id as string);
            if (response.status === 201) {
                setUser({
                    ...user,
                    profileImage: null
                });

                setImage('');
                toast.success('Profile image removed successfully');
            } else {
                toast.error('Failed to remove profile image');
            }
        } catch (error) {
            console.error('Error removing profile image:', error);
            toast.error('Failed to remove profile image');
            throw error;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3, bgcolor: '#F3F7FB', borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}>
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
                    <UpdateProfileImage
                        setImage={setImage}
                        userImage={userImage}
                        userId={id}
                        onImageUpdate={handleProfileImageUpdate}
                        onImageRemove={handleProfileImageRemove}
                    />
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