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
    Paper,
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
import Logo from '../../statics/images/whitelogo.png'

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loggingIn, setLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { handleSessionStorage } = AuthenticationUtils();

    const defaultUser: IAuthentication = { email: "", password: "" };

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
        reset(defaultUser);
    }, []);

    const onSubmit = async (formData: IAuthentication) => {
        setLoggingIn(true);
        try {
            const response = await loginService(formData) as unknown as ILoginResponse;
            if (response?.status === 200) {
                const { accessToken, refreshToken } = response.data;
                handleSessionStorage(response.data, accessToken, refreshToken);
                toast.success(`Welcome ${response.data.firstName} 👋`);
                navigate(ROUTES.ASSETS_MANAGEMENT);
            }
        } catch (error) {
            console.error(error);
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setLoggingIn(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <AuthenticationContainerComponent>
            <Paper elevation={3} sx={{
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
            }}>
                <Grid container sx={{ minHeight: '90vh' }}>
                    {!isMobile && (
                        <Grid item md={6} sx={{
                            backgroundImage: `url(${AuthenticationImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }} />
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
                            backgroundColor: '#fff',
                        }}
                    >
                        {/* Logo & Header */}
                        <Box mb={4} textAlign="center">
                            <Box
                                component="img"
                                src={Logo}
                                alt="Pride Bank Logo"
                                width={isMobile ? 60 : 90}
                                sx={{ mb: 2 }}
                            />
                            <TypographyComponent
                                size="24px"
                                weight={700}
                                sx={{ color: '#BC892C' }}
                            >
                                Pride Bank ERP
                            </TypographyComponent>
                            <TypographyComponent
                                size="16px"
                                weight={500}
                                sx={{ color: '#666', mt: 1 }}
                            >
                                Sign in to continue
                            </TypographyComponent>
                        </Box>

                        {/* Login Form */}
                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <AuthenticationForm
                                register={register}
                                control={control}
                                formState={formState}
                                linkText="Forgot Password?"
                                linkPath={ROUTES.FORGOT_PASSWORD}
                                buttonText="Login"
                                showPassword={showPassword}
                                loggingIn={loggingIn}
                                handleClickShowPassword={handleClickShowPassword}
                                handleMouseDownPassword={handleMouseDownPassword}
                                password
                            />
                        </Box>

                        {/* Footer */}
                        <Box mt={6}>
                            <TypographyComponent
                                size="12px"
                                sx={{ color: '#999', textAlign: 'center' }}
                            >
                                &copy; 2025 Pride Bank Limited. All Rights Reserved.
                            </TypographyComponent>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </AuthenticationContainerComponent>
    );
};

export default Login;
