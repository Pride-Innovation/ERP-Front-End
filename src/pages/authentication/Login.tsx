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
    Typography,
    alpha,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AuthenticationImage from "../../statics/images/logo.png";
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
import Logo from '../../statics/images/whitelogo.png';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const GOLD_COLOR = '#BC892C';

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
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

    const currentYear = new Date().getFullYear();

    return (
        <AuthenticationContainerComponent>
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: '1100px',
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
                <Grid container>
                    {/* Left Panel - Brand Content */}
                    {!isMedium && (
                        <Grid
                            item
                            md={6}
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
                                {/* Animated Circles */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: '10%',
                                        width: 'min(280px, 70%)',
                                        height: 'min(280px, 70%)',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.1)',
                                        animation: 'rotate 30s linear infinite',
                                        '@keyframes rotate': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(360deg)' }
                                        },
                                        zIndex: 0
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: '15%',
                                        right: '5%',
                                        width: 'min(180px, 45%)',
                                        height: 'min(180px, 45%)',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.05)',
                                        animation: 'rotate 20s linear infinite reverse',
                                        zIndex: 0
                                    }}
                                />

                                {/* Logo */}
                                <Box
                                    component="img"
                                    src={Logo}
                                    alt="Pride Bank Logo"
                                    sx={{
                                        width: 120,
                                        mb: 4,
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                                        animation: 'pulse 3s infinite ease-in-out',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 0.9, transform: 'scale(1)' },
                                            '50%': { opacity: 1, transform: 'scale(1.05)' },
                                            '100%': { opacity: 0.9, transform: 'scale(1)' },
                                        }
                                    }}
                                />

                                {/* Brand Title */}
                                <Typography
                                    variant="h3"
                                    fontWeight={700}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 2,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Pride Bank
                                </Typography>

                                {/* Brand Subtitle */}
                                <Typography
                                    variant="h5"
                                    fontWeight={300}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 4,
                                        letterSpacing: 1,
                                        opacity: 0.95,
                                        textShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    Asset Management Portal
                                </Typography>

                                {/* Decorative Line */}
                                <Box
                                    sx={{
                                        width: '60px',
                                        height: '4px',
                                        background: `linear-gradient(to right, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0.6)})`,
                                        borderRadius: '2px',
                                        mb: 4
                                    }}
                                />

                                {/* Description */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: 'center',
                                        maxWidth: '85%',
                                        fontWeight: 300,
                                        lineHeight: 1.8,
                                        letterSpacing: 0.3,
                                        opacity: 0.9,
                                        position: 'relative',
                                        zIndex: 3
                                    }}
                                >
                                    Manage and track your organization's assets efficiently with our comprehensive management system.
                                </Typography>

                                {/* Features List */}
                                <Box sx={{ mt: 4, width: '85%', zIndex: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        bgcolor: GOLD_COLOR,
                                                        borderRadius: '50%',
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Asset Tracking
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        bgcolor: GOLD_COLOR,
                                                        borderRadius: '50%',
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Maintenance
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        bgcolor: GOLD_COLOR,
                                                        borderRadius: '50%',
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Reporting
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        bgcolor: GOLD_COLOR,
                                                        borderRadius: '50%',
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                    Analytics
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    {/* Right Panel - Login Form */}
                    <Grid
                        item
                        xs={12}
                        md={6}
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
                                justifyContent: 'space-between',
                                p: { xs: 2.5, sm: 3.5, md: 4.5 },
                                height: '100%',
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
                                                width: { xs: 70, sm: 90 },
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
                                            variant="subtitle1"
                                            color="text.secondary"
                                            sx={{ fontWeight: 400 }}
                                        >
                                            Asset Management Portal
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Login Header */}
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
                                    Welcome Back
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        mb: 0,
                                        lineHeight: 1.5
                                    }}
                                >
                                    Sign in to continue to your account
                                </Typography>
                            </Box>

                            {/* Login Form Wrapper */}
                            <Box
                                component="form"
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                sx={{
                                    mt: 0.5,
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                {/* Form Fields Card */}
                                <Box
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
                                        linkText="Forgot Password?"
                                        linkPath={ROUTES.FORGOT_PASSWORD}
                                        buttonText="Sign In"
                                        showPassword={showPassword}
                                        loggingIn={loggingIn}
                                        handleClickShowPassword={handleClickShowPassword}
                                        handleMouseDownPassword={handleMouseDownPassword}
                                        password
                                    />
                                </Box>

                                {/* Security Message */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mt: 2,
                                        p: 2,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.03),
                                        border: `1px dashed ${alpha(PRIMARY_COLOR, 0.2)}`
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            color: PRIMARY_COLOR,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <SecurityOutlined fontSize="small" />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Your login is secured with bank-level encryption
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Footer */}
                            <Box sx={{ mt: 'auto', pt: { xs: 2, sm: 3 } }}>
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

export default Login;