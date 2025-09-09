/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    alpha,
    useTheme,
    useMediaQuery,
    Paper,
    Button,
    Stack,
    Divider
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthenticationImage from "../../statics/images/logo.png";
import { authentiactionSchema } from './schema';
import { IAuthentication } from './interface';
import { useEffect, useState } from 'react';
import AuthenticationForm from './forms';
import { ROUTES } from '../../core/routes/routes';
import AuthenticationContainerComponent from '../../components/Container';
import Logo from '../../statics/images/whitelogo.png';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Link } from 'react-router-dom';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const GOLD_COLOR = '#BC892C';

const PasswordReset = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
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

    const onSubmit = (formData: IAuthentication) => {
        setLoggingIn(true);
        console.log(formData, "form data!!!!!");

        // Simulate API call for password reset
        setTimeout(() => {
            setLoggingIn(false);
            setEmailSent(true);
        }, 1500);
    };

    const currentYear = new Date().getFullYear();
    const userEmail = watch('email');

    return (
        <AuthenticationContainerComponent>
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: '900px',
                    borderRadius: { xs: 3, md: 4 },
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255,255,255,0.9)',
                    animation: 'fadeIn 0.8s ease-out',
                    '@keyframes fadeIn': {
                        '0%': {
                            opacity: 0,
                            transform: 'translateY(20px)'
                        },
                        '100%': {
                            opacity: 1,
                            transform: 'translateY(0)'
                        }
                    }
                }}
            >
                <Grid container sx={{ minHeight: { xs: 'auto', md: '550px' } }}>
                    {/* Left panel - only visible on medium screens and up */}
                    {!isMedium && (
                        <Grid
                            item
                            md={5}
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: `linear-gradient(135deg, 
                                                ${alpha(PRIMARY_COLOR, 0.95)} 0%,
                                                ${alpha(PRIMARY_COLOR, 0.8)} 100%)`,
                                    zIndex: 1
                                }
                            }}
                        >
                            {/* Background Image */}
                            <Box
                                sx={{
                                    backgroundImage: `url(${AuthenticationImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '100%',
                                    filter: 'grayscale(20%)',
                                }}
                            />

                            {/* Brand Content Overlay */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 2,
                                    p: 4,
                                    color: 'white'
                                }}
                            >
                                {/* Logo */}
                                <Box
                                    component="img"
                                    src={Logo}
                                    alt="Pride Bank Logo"
                                    sx={{
                                        width: 100,
                                        mb: 4,
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                                    }}
                                />

                                {/* Large Lock Icon */}
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 4,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <LockResetOutlinedIcon sx={{ fontSize: 60, color: '#fff' }} />
                                </Box>

                                {/* Brand Title */}
                                <Typography
                                    variant="h5"
                                    fontWeight={600}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 2,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Reset Your Password
                                </Typography>

                                {/* Brand Subtitle */}
                                <Typography
                                    variant="body1"
                                    fontWeight={300}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 4,
                                        opacity: 0.95,
                                        textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                        maxWidth: '80%'
                                    }}
                                >
                                    We'll send you an email with instructions to reset your password
                                </Typography>

                                {/* Decorative Line */}
                                <Box
                                    sx={{
                                        width: '60px',
                                        height: '4px',
                                        background: `linear-gradient(to right, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0.6)})`,
                                        borderRadius: '2px',
                                    }}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* Right panel - Form section */}
                    <Grid
                        item
                        xs={12}
                        md={7}
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: { xs: 3, md: '0 4px 4px 0' },
                            boxShadow: { xs: '0 10px 40px rgba(0,0,0,0.15)', md: 'none' },
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative Elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -60,
                                right: -60,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${alpha(PRIMARY_COLOR, 0.1)} 0%, ${alpha(PRIMARY_COLOR, 0)} 70%)`,
                                zIndex: 0
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -90,
                                left: -90,
                                width: 180,
                                height: 180,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${alpha(GOLD_COLOR, 0.08)} 0%, ${alpha(GOLD_COLOR, 0)} 70%)`,
                                zIndex: 0
                            }}
                        />

                        {/* Form Content */}
                        <CardContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: { xs: 3, sm: 4, md: 5 },
                                height: '100%',
                                minHeight: { xs: '500px', md: '550px' },
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Mobile Logo - only shows on medium and smaller screens */}
                            {isMedium && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box
                                            component="img"
                                            src={Logo}
                                            alt="Pride Bank Logo"
                                            sx={{
                                                width: { xs: 70, sm: 80 },
                                                mb: 2,
                                                filter: 'brightness(0.95) contrast(1.05)'
                                            }}
                                        />
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color={PRIMARY_COLOR}
                                            sx={{ mb: 0.5 }}
                                        >
                                            Pride Bank
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Password Reset
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Back to Login Link */}
                            <Button
                                component={Link}
                                to={ROUTES.LOGIN}
                                startIcon={<KeyboardBackspaceIcon />}
                                variant="text"
                                size="small"
                                sx={{
                                    alignSelf: 'flex-start',
                                    mb: 3,
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: alpha('#000', 0.03),
                                        color: 'text.primary'
                                    }
                                }}
                            >
                                Back to Login
                            </Button>

                            {/* Success or Form Content */}
                            {emailSent ? (
                                <Box
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        py: 3,
                                        animation: 'fadeIn 0.5s ease-out',
                                    }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            maxWidth: 400,
                                            p: 3,
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            bgcolor: alpha('#f9f9f9', 0.6),
                                            border: `1px solid ${alpha('#000', 0.04)}`,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: '50%',
                                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                color: PRIMARY_COLOR,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 3
                                            }}
                                        >
                                            <EmailOutlinedIcon sx={{ fontSize: 36 }} />
                                        </Box>

                                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                                            Check Your Email
                                        </Typography>

                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                            We've sent password reset instructions to:
                                        </Typography>

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                py: 2,
                                                px: 3,
                                                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                                borderRadius: 1.5,
                                                mb: 3,
                                                border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                fontWeight={500}
                                                color={PRIMARY_COLOR}
                                            >
                                                {userEmail || "your email address"}
                                            </Typography>
                                        </Paper>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Didn't receive an email? Check your spam folder or try again with a different email address.
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => setEmailSent(false)}
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 1.5,
                                                px: 3
                                            }}
                                        >
                                            Try Again
                                        </Button>
                                    </Paper>
                                </Box>
                            ) : (
                                <>
                                    {/* Form Header */}
                                    <Box
                                        sx={{
                                            mb: 4,
                                            position: 'relative',
                                            pb: 1
                                        }}
                                    >
                                        {/* Decorative element */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: -20,
                                                top: 12,
                                                width: 4,
                                                height: 20,
                                                backgroundColor: PRIMARY_COLOR,
                                                borderRadius: 1
                                            }}
                                        />

                                        <Typography
                                            variant="h4"
                                            fontWeight={700}
                                            color="text.primary"
                                            sx={{
                                                mb: 1.5,
                                                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${alpha(PRIMARY_COLOR, 0.7)} 100%)`,
                                                backgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                WebkitBackgroundClip: 'text'
                                            }}
                                        >
                                            Reset Your Password
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ lineHeight: 1.6 }}
                                        >
                                            Enter the email associated with your account, and we'll send you instructions to reset your password.
                                        </Typography>
                                    </Box>

                                    {/* Form */}
                                    <Box
                                        component="form"
                                        onSubmit={handleSubmit(onSubmit)}
                                        autoComplete="off"
                                        sx={{
                                            mt: 0.5,
                                            position: 'relative',
                                            zIndex: 1,
                                            flex: 1
                                        }}
                                    >
                                        {/* Form Fields Card */}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 2.5, sm: 3 },
                                                borderRadius: 2,
                                                bgcolor: alpha('#f9f9f9', 0.5),
                                                border: `1px solid ${alpha('#000', 0.04)}`,
                                                mb: 3,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: `0 4px 20px ${alpha('#000', 0.05)}`,
                                                    bgcolor: '#fff'
                                                }
                                            }}
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
                                        </Paper>
                                    </Box>
                                </>
                            )}

                            {/* Footer */}
                            <Box sx={{ mt: 'auto', pt: 4 }}>
                                <Divider sx={{ mb: 2.5, opacity: 0.6 }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: alpha('#000', 0.6),
                                            display: 'block'
                                        }}
                                    >
                                        &copy; {currentYear} Pride Bank Limited.
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: alpha('#000', 0.5) }}
                                    >
                                        All Rights Reserved.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Grid>
                </Grid>
            </Card>
        </AuthenticationContainerComponent>
    );
};

export default PasswordReset;