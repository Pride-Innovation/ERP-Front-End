import {
    Box,
    Grid,
} from '@mui/material';
import {
    useForm
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthenticationImage from "../../statics/images/logo.1b6cf8fbdaaee75f39fd.bmp";
import { authentiactionSchema } from './schema';
import { IAuthentication } from './interface';
import { useEffect, useState } from 'react';
import AuthenticationForm from './forms';
import { TypographyComponent } from '../../components/headers/TypographyComponent';

const PasswordReset = () => {
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const defaultUser: IAuthentication = { email: "", password: "reset-password" };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); };

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IAuthentication>({
        mode: 'onChange',
        resolver: yupResolver(authentiactionSchema)
    });

    useEffect(() => { reset({ ...defaultUser }) }, []);

    const onSubmit = (formData: IAuthentication) => {

        setLoggingIn(true);
        console.log(formData, "form data!!!!!")
    };

    return (
        <Grid container xs={10} md={6} item>
            <Grid item xs={12} md={6} >
                <Box component="img" src={AuthenticationImage} alt='Login Image' height={500} width={"100%"} />
            </Grid>
            <Grid item xs={12} md={6} spacing={6} p={4}
                sx={(theme) => ({
                    bgcolor: theme.palette.background.paper,
                    display: "flex",
                    flexDirection: "column"
                })}
            >
                <Box>
                    <TypographyComponent sx={{ mb: 3 }} size={"20px"} weight={600}>Request Password Reset</TypographyComponent>
                    <TypographyComponent sx={{ mb: 2 }} size='16px' weight={500}>
                        Enter the email associated with your account to request for password reset
                    </TypographyComponent>
                </Box>
                <Box sx={{ width: "100%", mt: 3 }}>
                    <form
                        style={{ width: "100%" }}
                        autoComplete="false"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <AuthenticationForm
                            linkPath='/'
                            buttonText="Submit"
                            register={register}
                            formState={formState}
                            control={control}
                            showPassword={showPassword}
                            loggingIn={loggingIn}
                            handleClickShowPassword={handleClickShowPassword}
                            handleMouseDownPassword={handleMouseDownPassword}
                            linkText='Back To Login'
                        />
                    </form>
                </Box>
            </Grid>
        </Grid>
    )
}

export default PasswordReset