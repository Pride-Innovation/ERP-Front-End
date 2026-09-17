/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Box,
    Button,
    Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authentiactionSchema } from './schema';
import { IAuthentication, IPasswordResetResponse } from './interface';
import { useEffect, useState } from 'react';
import AuthenticationForm from './forms';
import { ROUTES } from '../../core/routes/routes';
import AuthenticationContainerComponent from '../../components/Container';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Link } from 'react-router-dom';
import { requestPasswordResetService } from './service';
import { AuthCard, AuthFooter, AuthHeading, AuthLogo } from './AuthCard';

const PRIMARY_COLOR = '#08796C';

const PasswordReset = () => {
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const defaultUser: IAuthentication = { email: "", password: "reset-password" };

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
        watch
    } = useForm<IAuthentication>({
        mode: 'onChange',
        resolver: yupResolver(authentiactionSchema)
    });

    useEffect(() => { reset({ ...defaultUser }) }, []);

    const onSubmit = async (formData: IAuthentication) => {
        setLoggingIn(true);
        try {
            const response = await requestPasswordResetService(formData.email) as IPasswordResetResponse;
            if (response.status === 201 && response.data.status) {
                setEmailSent(true);
            }
        } catch (error) {
        } finally {
            setLoggingIn(false);
        }
    };

    const userEmail = watch('email');

    return (
        <AuthenticationContainerComponent>
            <AuthCard>
                <AuthLogo />

                {emailSent ? (
                    /* ── Success state ─────────────────────────────────── */
                    <>
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                    color: PRIMARY_COLOR,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <EmailOutlinedIcon sx={{ fontSize: 30 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                                Check your email
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                We've sent password reset instructions to:
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                py: 1.5,
                                px: 2,
                                textAlign: 'center',
                                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                borderRadius: 2,
                                border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                                {userEmail || "your email address"}
                            </Typography>
                        </Box>

                        <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                            Didn't receive an email? Check your spam folder or try again with a
                            different email address.
                        </Typography>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setEmailSent(false)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '10px',
                                height: 44,
                                color: PRIMARY_COLOR,
                                borderColor: alpha(PRIMARY_COLOR, 0.4),
                                '&:hover': { borderColor: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.04) },
                            }}
                        >
                            Try Again
                        </Button>
                    </>
                ) : (
                    /* ── Request form ──────────────────────────────────── */
                    <>
                        <AuthHeading
                            title="Reset your password"
                            subtitle="Enter the email associated with your account, and we'll send you instructions to reset your password."
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
                                linkText=""
                                linkPath=""
                                buttonText="Send Reset Instructions"
                                showPassword={showPassword}
                                loggingIn={loggingIn}
                                handleClickShowPassword={handleClickShowPassword}
                                handleMouseDownPassword={handleMouseDownPassword}
                            />
                        </Box>
                    </>
                )}

                {/* Back to sign in — the template's footer-link idiom */}
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748B' }}>
                    <Typography
                        component={Link}
                        to={ROUTES.LOGIN}
                        variant="body2"
                        sx={{
                            color: PRIMARY_COLOR,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        <KeyboardBackspaceIcon sx={{ fontSize: 16 }} />
                        Back to sign in
                    </Typography>
                </Typography>

                <AuthFooter />
            </AuthCard>
        </AuthenticationContainerComponent>
    );
};

export default PasswordReset;
