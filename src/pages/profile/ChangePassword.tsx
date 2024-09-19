import { Box } from "@mui/material"
import { useEffect, useState } from "react";
import { IChangePassword } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "./schema";
import ChangePasswordForm from "./ChangePasswordForm";

const ChangePassword = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const defaultUser: IChangePassword = { oldPassword: "", newPassword: "", confirmPassword: "" };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
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
                    formState = {formState}
                    control = {control}
                    register = {register}
                    buttonText = "Submit"
                    showPassword = {showPassword}
                    sendingRequest = {sendingRequest}
                    handleClickShowPassword = {handleClickShowPassword}
                    handleMouseDownPassword = {handleMouseDownPassword}
                />
            </form>
        </Box>
    )
}

export default ChangePassword