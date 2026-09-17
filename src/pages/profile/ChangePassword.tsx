/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from "@mui/material"
import { useEffect, useState } from "react";
import { IChangePassword, IChangePasswordComponent } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "./schema";
import ChangePasswordForm from "./ChangePasswordForm";
import { changeUserPasswordService } from "./service";
import { toast } from "react-toastify";
import { refusal } from "../../core/apis/globalService";

const ChangePassword = ({ handleClose }: IChangePasswordComponent) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const defaultUser: IChangePassword = { oldPassword: "", newPassword: "", confirmPassword: "" };

    const handleClickShowOldPassword = () => setShowOldPassword((show) => !show);
    const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); };

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        getValues,
        watch
    } = useForm<IChangePassword>({
        mode: 'onChange',
        resolver: yupResolver(changePasswordSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    useEffect(() => { reset({ ...defaultUser }) }, []);

    const onSubmit = async (formData: IChangePassword) => {
        setSendingRequest(true);
        try {
            const response = await changeUserPasswordService(formData);
            if (response.status === 201) {
                handleClose();
                reset({ ...defaultUser });
                toast.success("Password changed successfully");
            }
            /*
             * Anything that is not a 201 is a refusal, and it has to be shown.
             *
             * This swallowed every failure into a console line and then closed the modal in
             * `finally` — so a wrong old password, or a new one the server rejects, looked exactly
             * like success: the dialog shut, nothing was said, and the person believed their
             * password had changed. That became far more likely the moment a password policy
             * existed, because "too short" is now a refusal an ordinary user will meet.
             */
            toast.error(refusal(response, 'Could not change your password. Please try again.'));
        } catch (error) {
            console.error('Password change failed', error);
            toast.error(refusal(error, 'Could not change your password. Please try again.'));
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <form
                style={{ width: "100%" }}
                autoComplete="false"
                onSubmit={handleSubmit(onSubmit)}
            >
                <ChangePasswordForm
                    handleClose={handleClose}
                    formState={formState}
                    control={control}
                    register={register}
                    buttonText="Submit"
                    showOldPassword={showOldPassword}
                    showNewPassword={showNewPassword}
                    showConfirmPassword={showConfirmPassword}
                    sendingRequest={sendingRequest}
                    handleClickShowOldPassword={handleClickShowOldPassword}
                    handleClickShowNewPassword={handleClickShowNewPassword}
                    handleClickShowConfirmPassword={handleClickShowConfirmPassword}
                    handleMouseDownPassword={handleMouseDownPassword}
                    getValues={getValues}
                    watch={watch}
                />
            </form>
        </Box>
    )
}

export default ChangePassword