/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthenticationImage from "../../statics/images/logo.png";
import { authentiactionSchema } from './schema';
import { IAuthentication, ILoginResponse } from './interface';
import { useEffect, useState } from 'react';
import { TypographyComponent } from '../../components/headers/TypographyComponent';
import AuthenticationForm from './forms';
import { ROUTES } from '../../core/routes/routes';
import { useNavigate } from 'react-router';
import AuthenticationContainerComponent from '../../components/Container';
import AuthenticationUtils from './utills';
import { toast } from 'react-toastify';
import { loginService } from './service';

const Login = () => {
    const [loggingIn, setLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const defaultUser: IAuthentication = { email: "", password: "" };
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { handleSessionStorage } = AuthenticationUtils();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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

    useEffect(() => {
        reset({ ...defaultUser });
    }, []);

    const onSubmit = async (formData: IAuthentication) => {
        setLoggingIn(true);
        try {
            const response = await loginService(formData) as unknown as ILoginResponse;
            if (response?.status === 200) {
                const { accessToken, refreshToken } = response.data;
                handleSessionStorage(response.data, accessToken, refreshToken);
                toast.success(`Welcome ${response.data.firstName} !!`);
                navigate(ROUTES.ASSETS_MANAGEMENT);
            }
        } catch (error) {
            console.log(error);
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <AuthenticationContainerComponent>
            <Grid
                container
                spacing={0}
                sx={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {!isMobile && (
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src={AuthenticationImage}
                            alt="Login"
                            sx={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                backgroundColor: '#f4f4f4',
                            }}
                        />
                    </Grid>
                )}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        bgcolor: '#fff',
                    }}
                >
                    <Box mb={4}>
                        <TypographyComponent
                            size="24px"
                            weight={700}
                            sx={{ color: '#BC892C', mb: 1 }}
                        >
                            Pride Microfinance (ERP)
                        </TypographyComponent>
                        <TypographyComponent
                            size="16px"
                            weight={500}
                            sx={{ color: '#000' }}
                        >
                            Sign In to your account
                        </TypographyComponent>
                    </Box>
                    <Box>
                        <form
                            style={{ width: '100%' }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <AuthenticationForm
                                linkPath={ROUTES.FORGOT_PASSWORD}
                                buttonText="Login"
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
    );
};

export default Login;
