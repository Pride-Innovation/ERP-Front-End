/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authentiactionSchema } from './schema';
import { IAuthentication, ILoginResponse } from './interface';
import { useEffect, useState } from 'react';
import AuthenticationForm from './forms';
import { ROUTES } from '../../core/routes/routes';
import { useNavigate } from 'react-router';
import AuthenticationContainerComponent from '../../components/Container';
import AuthenticationUtils from './utills';
import { toast } from 'react-toastify';
import { loginService } from './service';
import { AuthCard, AuthFooter, AuthHeading, AuthLogo } from './AuthCard';
import { passwordsAreLocal, useAuthMode } from './useAuthMode';

const Login = () => {
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleSessionStorage } = AuthenticationUtils();
    const authMode = useAuthMode();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IAuthentication>({
        mode: 'onChange',
        resolver: yupResolver(authentiactionSchema),
    });

    useEffect(() => { reset({ email: '', password: '' }); }, []);

    const onSubmit = async (formData: IAuthentication) => {
        setLoggingIn(true);
        try {
            const response = await loginService(formData) as unknown as ILoginResponse;
            if (response?.status === 200) {
                const { accessToken, refreshToken } = response.data;

                /*
                 * A 200 that carries no token is a failed sign-in, whatever the status says.
                 * Without this, `handleSessionStorage` writes the string "undefined" into
                 * sessionStorage, which reads as a valid session everywhere afterwards.
                 */
                if (!accessToken) {
                    toast.error('Sign-in did not return a session. Please try again.');
                    return;
                }

                handleSessionStorage(response.data, accessToken, refreshToken);
                toast.success(`Welcome back, ${response.data.firstName} 👋`);
                navigate(ROUTES.ASSETS_MANAGEMENT);
            } else {
                // loginService catches errors and returns them — extract the error detail
                const errorData = (response as any)?.response?.data;
                const errorCode: string | undefined = errorData?.errorCode;
                const detail: string | undefined = errorData?.detail;

                if (errorCode === 'ACCOUNT_BLOCKED') {
                    toast.error(detail || 'Your account has been blocked. Please contact your admin.');
                } else if (errorCode === 'ACCOUNT_DISABLED') {
                    toast.error('Your account has been disabled. Please contact your admin.');
                } else if (errorCode === 'ACCOUNT_LOCKED') {
                    toast.error(detail || 'Your account is locked. Please verify your email.');
                } else if (errorCode === 'USER_THROTTLED') {
                    toast.error(detail || 'Too many failed sign-in attempts. Please wait 15 minutes and try again.');
                } else if (errorCode === 'SIGN_IN_UNAVAILABLE') {
                    // The sign-in service, not the person: a wrong-password message here would send
                    // them to reset a password that is fine.
                    toast.error(detail || 'Sign-in is temporarily unavailable. Please try again shortly.');
                } else if (errorCode === 'VALIDATION_ERROR') {
                    toast.error('Enter your email address and password.');
                } else if (errorCode === 'INVALID_CREDENTIALS') {
                    toast.error(detail || 'Incorrect email or password.');
                } else {
                    toast.error(detail || 'Sign-in failed. Please try again.');
                }
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <AuthenticationContainerComponent>
            <AuthCard>
                <AuthLogo />
                <AuthHeading
                    title="Sign in"
                    subtitle={authMode === 'LDAP'
                        ? 'Sign in with your email address and your Windows (network) password.'
                        : 'Enter your credentials to access the Asset Management Portal.'}
                />
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    autoComplete="off"
                    sx={{ display: 'flex', flexDirection: 'column' }}
                >
                    <AuthenticationForm
                        register={register}
                        control={control}
                        formState={formState}
                        // AD owns the password in LDAP mode: there is nothing here to reset.
                        linkText={passwordsAreLocal(authMode) ? 'Forgot password?' : undefined}
                        linkPath={ROUTES.FORGOT_PASSWORD}
                        buttonText="Sign In"
                        showPassword={showPassword}
                        loggingIn={loggingIn}
                        handleClickShowPassword={handleClickShowPassword}
                        handleMouseDownPassword={handleMouseDownPassword}
                        password
                    />
                </Box>
                <AuthFooter />
            </AuthCard>
        </AuthenticationContainerComponent>
    );
};

export default Login;
