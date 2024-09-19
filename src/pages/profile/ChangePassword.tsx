import { Box } from "@mui/material"
import { useEffect, useState } from "react";
import { IChangePassword, IChangePasswordComponent } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "./schema";
import ChangePasswordForm from "./ChangePasswordForm";

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
        reset
    } = useForm<IChangePassword>({
        mode: 'onChange',
        resolver: yupResolver(changePasswordSchema)
    });

    useEffect(() => { reset({ ...defaultUser }) }, []);

    const onSubmit = (formData: IChangePassword) => {
        setSendingRequest(true);
        console.log(formData, "form data!!!!!")
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
                />
            </form>
        </Box>
    )
}

export default ChangePassword