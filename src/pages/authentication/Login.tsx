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
import { IAuthentication, ILoginResponse, IUserProfileResponse } from './interface';
import { useEffect, useState } from 'react';
import { TypographyComponent } from '../../components/headers/TypographyComponent';
import AuthenticationForm from './forms';
import { ROUTES } from '../../core/routes/routes';
import { useNavigate } from 'react-router';
import AuthenticationContainerComponent from '../../components/Container';
import AuthenticationUtils from './utills';
import { toast } from 'react-toastify';
import { loginService, userProfileService } from './service';
import { IUser } from '../users/interface';
import { ErrorMessage } from '../../utils/constants';

const Login = () => {
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const defaultUser: IAuthentication = { email: "", password: "" };
    const navigate = useNavigate();
    const { handleSessionStorage } = AuthenticationUtils();
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); };

    const { REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET } = process.env
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

    const onSubmit = async (formData: IAuthentication) => {
        setLoggingIn(true);
        try {
            const request = {
                email: formData.email,
                password: formData.password,
                client_id: REACT_APP_CLIENT_ID,
                client_secret: REACT_APP_CLIENT_SECRET
            }

            const response = await loginService(request) as unknown as ILoginResponse;
            if (response.status === 'failed') return toast.error(response?.message);
            const res = await userProfileService(response.data?.access_token as string) as unknown as IUserProfileResponse;
            if (res.status === "failed") return ErrorMessage;
            handleSessionStorage(res.data?.user as IUser, response.data?.access_token as string)
            toast.success(`Welcome ${res.data?.user?.name} !!`)
            navigate(ROUTES.ASSETS_MANAGEMENT);
        } catch (error) {
            toast.error("Invalid user Credentials")
            console.log(error, "Error Information!!")
        }
        setLoggingIn(false);
    };

    return (
        <AuthenticationContainerComponent >
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
                        <TypographyComponent sx={{ mb: 2 }} size={"20px"} weight={600}>Pride Microfinance (ERP)</TypographyComponent>
                        <TypographyComponent sx={{ mb: 2 }} size='16px' weight={500}>Sign In to your account</TypographyComponent>
                    </Box>
                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
                        <form
                            style={{ width: "100%" }}
                            autoComplete="false"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <AuthenticationForm
                                linkPath={ROUTES.FORGOT_PASSWORD}
                                buttonText="Submit"
                                register={register}
                                formState={formState}
                                control={control}
                                showPassword={showPassword}
                                loggingIn={loggingIn}
                                handleClickShowPassword={handleClickShowPassword}
                                handleMouseDownPassword={handleMouseDownPassword}
                                linkText='Forgot Password?'
                                password
                            />
                        </form>
                    </Box>
                </Grid>
            </Grid>
        </AuthenticationContainerComponent>
    )
}

export default Login;