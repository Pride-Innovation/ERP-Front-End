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
    TextField,
    InputAdornment,
    IconButton,
    Button,
    FormControl,
    FormHelperText,
    LinearProgress,
    Paper,
    Stack,
    Divider,
    Alert
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthenticationImage from "../../statics/images/logo.png";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthenticationContainerComponent from '../../components/Container';
import { toast } from 'react-toastify';
import Logo from '../../statics/images/whitelogo.png';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import { ROUTES } from '../../core/routes/routes';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const GOLD_COLOR = '#BC892C';

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;

    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 10; // lowercase
    if (/[A-Z]/.test(password)) score += 20; // uppercase
    if (/[0-9]/.test(password)) score += 20; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 20; // special chars

    return Math.min(score, 100);
};

// Get strength label and color
const getStrengthInfo = (strength: number) => {
    if (strength === 0) return { label: 'No Password', color: '#bdbdbd' };
    if (strength < 30) return { label: 'Very Weak', color: '#f44336' };
    if (strength < 50) return { label: 'Weak', color: '#ff9800' };
    if (strength < 70) return { label: 'Fair', color: '#ffeb3b' };
    if (strength < 90) return { label: 'Good', color: '#4caf50' };
    return { label: 'Strong', color: '#2e7d32' };
};

// Form interface
interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

// Password requirement item props
interface RequirementItemProps {
    text: string;
    fulfilled: boolean;
    active?: boolean;
}

// Form validation schema
const resetPasswordSchema = yup.object({
    newPassword: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[A-Z]/, 'Password must include an uppercase letter')
        .matches(/[a-z]/, 'Password must include a lowercase letter')
        .matches(/[0-9]/, 'Password must include a number')
        .matches(/[^A-Za-z0-9]/, 'Password must include a special character'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
}).required();

const ResetPassword = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [resetSuccess, setResetSuccess] = useState<boolean>(false);

    // Initialize form with validation
    const {
        control,
        handleSubmit,
        register,
        formState,
        watch,
        reset
    } = useForm<ResetPasswordFormData>({
        mode: 'onChange',
        resolver: yupResolver(resetPasswordSchema)
    });

    // Reset form on mount
    useEffect(() => {
        reset({
            newPassword: '',
            confirmPassword: ''
        });
    }, [reset]);

    // Watch password for strength calculation
    const newPassword = watch('newPassword') || '';

    // Calculate password strength
    const passwordStrength = useMemo(() => {
        return calculatePasswordStrength(newPassword);
    }, [newPassword]);

    const strengthInfo = getStrengthInfo(passwordStrength);

    // Password requirement checks
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);

    // Check if field has been interacted with
    const isPasswordFieldActive = formState.touchedFields.newPassword || newPassword.length > 0;

    // Toggle password visibility
    const handleToggleNewPassword = () => setShowNewPassword(prev => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);
    const handleMouseDownPassword = (e: React.MouseEvent) => e.preventDefault();

    // Form submission
    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, you'd call your API here
            // const response = await resetPasswordService(token, data.newPassword);

            toast.success('Your password has been reset successfully!');
            setResetSuccess(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <AuthenticationContainerComponent>
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    borderRadius: { xs: 3, md: 4 },
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255,255,255,0.9)',
                    animation: 'fadeIn 0.8s ease-out',
                    '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                }}
            >
                <Grid container sx={{ height: '100%' }}>
                    {/* Left Panel - Brand Content */}
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
                                    p: 3,
                                    color: 'white'
                                }}
                            >
                                {/* Logo */}
                                <Box
                                    component="img"
                                    src={Logo}
                                    alt="Pride Bank Logo"
                                    sx={{
                                        width: 90,
                                        mb: 3,
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                                    }}
                                />

                                {/* Large Lock Icon */}
                                <Box
                                    sx={{
                                        width: 90,
                                        height: 90,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <LockResetOutlinedIcon sx={{ fontSize: 45, color: '#fff' }} />
                                </Box>

                                {/* Brand Title */}
                                <Typography
                                    variant="h5"
                                    fontWeight={600}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 1.5,
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
                                        mb: 2.5,
                                        opacity: 0.95,
                                        textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                        maxWidth: '80%',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Create a new secure password for your account
                                </Typography>

                                {/* Decorative Line */}
                                <Box
                                    sx={{
                                        width: '50px',
                                        height: '3px',
                                        background: `linear-gradient(to right, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0.6)})`,
                                        borderRadius: '2px',
                                        mb: 2.5
                                    }}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* Right Panel - Password Reset Form */}
                    <Grid
                        item
                        xs={12}
                        md={7}
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: { xs: 3, md: '0 4px 4px 0' },
                            boxShadow: { xs: '0 10px 40px rgba(0,0,0,0.15)', md: 'none' },
                            position: 'relative',
                            overflow: 'auto'
                        }}
                    >
                        {/* Decorative Elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${alpha(PRIMARY_COLOR, 0.1)} 0%, ${alpha(PRIMARY_COLOR, 0)} 70%)`,
                                zIndex: 0
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -70,
                                left: -70,
                                width: 140,
                                height: 140,
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
                                p: { xs: 2.5, sm: 3, md: 3 },
                                height: '100%',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            {/* Mobile Logo - only shows on medium and smaller screens */}
                            {isMedium && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box
                                            component="img"
                                            src={Logo}
                                            alt="Pride Bank Logo"
                                            sx={{
                                                width: { xs: 60, sm: 70 },
                                                mb: 1.5,
                                                filter: 'brightness(0.95) contrast(1.05)'
                                            }}
                                        />
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color={PRIMARY_COLOR}
                                            sx={{ mb: 0.5, fontSize: '1.25rem' }}
                                        >
                                            Pride Bank
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Reset Your Password
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Back to Login Link */}
                            <Button
                                component={Link}
                                to={ROUTES.LOGIN}
                                startIcon={<KeyboardBackspaceIcon sx={{ fontSize: '1rem' }} />}
                                variant="text"
                                size="small"
                                sx={{
                                    alignSelf: 'flex-start',
                                    mb: 2,
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    fontSize: '0.8rem',
                                    '&:hover': {
                                        bgcolor: alpha('#000', 0.03),
                                        color: 'text.primary'
                                    }
                                }}
                            >
                                Back to Login
                            </Button>

                            {resetSuccess ? (
                                /* Success message */
                                <Box
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        py: 2,
                                        animation: 'fadeIn 0.5s ease-out',
                                    }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            maxWidth: 380,
                                            p: 2.5,
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            bgcolor: alpha('#f9f9f9', 0.6),
                                            border: `1px solid ${alpha('#000', 0.04)}`,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                bgcolor: alpha('#4caf50', 0.1),
                                                color: '#4caf50',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2
                                            }}
                                        >
                                            <CheckCircleIcon sx={{ fontSize: 30 }} />
                                        </Box>

                                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1, fontSize: '1.3rem' }}>
                                            Password Reset Successful
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Your password has been reset successfully. You can now log in with your new password.
                                        </Typography>

                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to={ROUTES.LOGIN}
                                            sx={{
                                                bgcolor: PRIMARY_COLOR,
                                                textTransform: 'none',
                                                borderRadius: 1.5,
                                                px: 3,
                                                py: 0.75,
                                                '&:hover': {
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.9)
                                                }
                                            }}
                                        >
                                            Return to Login
                                        </Button>
                                    </Paper>
                                </Box>
                            ) : (
                                /* Reset Password Form */
                                <>
                                    {/* Form Header */}
                                    <Box
                                        sx={{
                                            mb: 2.5,
                                            position: 'relative',
                                            pb: 0.5
                                        }}
                                    >
                                        {/* Decorative element */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: -15,
                                                top: 10,
                                                width: 3,
                                                height: 16,
                                                backgroundColor: PRIMARY_COLOR,
                                                borderRadius: 1
                                            }}
                                        />

                                        <Typography
                                            variant="h4"
                                            fontWeight={700}
                                            color="text.primary"
                                            sx={{
                                                mb: 1,
                                                fontSize: { xs: '1.75rem', sm: '2rem' },
                                                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${alpha(PRIMARY_COLOR, 0.7)} 100%)`,
                                                backgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                WebkitBackgroundClip: 'text'
                                            }}
                                        >
                                            Create a New Password
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{
                                                lineHeight: 1.4,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Please create a strong password that you don't use elsewhere
                                        </Typography>
                                    </Box>

                                    <Box
                                        component="form"
                                        onSubmit={handleSubmit(onSubmit)}
                                        sx={{ mt: 1 }}
                                        noValidate
                                    >
                                        <Grid container spacing={2.5}>
                                            {/* Left column with input fields */}
                                            <Grid item xs={12} md={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: { xs: 2, sm: 2.5 },
                                                        borderRadius: 2,
                                                        bgcolor: alpha('#f9f9f9', 0.5),
                                                        border: `1px solid ${alpha('#000', 0.04)}`,
                                                        mb: { xs: 2, md: 0 },
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: `0 4px 20px ${alpha('#000', 0.05)}`,
                                                            bgcolor: '#fff'
                                                        }
                                                    }}
                                                >
                                                    {/* New Password */}
                                                    <FormControl fullWidth variant="outlined" sx={{ mb: 2.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mb: 0.5,
                                                                ml: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.8rem',
                                                                color: isPasswordFieldActive ? PRIMARY_COLOR : 'text.secondary',
                                                            }}
                                                        >
                                                            New Password
                                                        </Typography>
                                                        <TextField
                                                            {...register('newPassword')}
                                                            id="newPassword"
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            variant="outlined"
                                                            fullWidth
                                                            error={!!formState.errors.newPassword}
                                                            placeholder="Enter your new password"
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleToggleNewPassword}
                                                                            onMouseDown={handleMouseDownPassword}
                                                                            edge="end"
                                                                            size="small"
                                                                        >
                                                                            {showNewPassword ? (
                                                                                <VisibilityOffOutlined fontSize="small" />
                                                                            ) : (
                                                                                <VisibilityOutlined fontSize="small" />
                                                                            )}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                                sx: {
                                                                    borderRadius: 1.5,
                                                                    bgcolor: '#fff',
                                                                    height: 45
                                                                }
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: formState.errors.newPassword
                                                                        ? theme.palette.error.main
                                                                        : isPasswordFieldActive
                                                                            ? PRIMARY_COLOR
                                                                            : alpha('#000', 0.15),
                                                                    borderWidth: formState.errors.newPassword || isPasswordFieldActive ? 1.5 : 1,
                                                                }
                                                            }}
                                                        />

                                                        {formState.errors.newPassword ? (
                                                            <FormHelperText error>
                                                                {formState.errors.newPassword.message}
                                                            </FormHelperText>
                                                        ) : null}

                                                        {/* Password Strength Meter */}
                                                        {newPassword.length > 0 && (
                                                            <Box sx={{ mt: 1.5 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                                        Password strength:
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            color: strengthInfo.color
                                                                        }}
                                                                    >
                                                                        {strengthInfo.label}
                                                                    </Typography>
                                                                </Box>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={passwordStrength}
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 1,
                                                                        bgcolor: alpha('#000', 0.1),
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: strengthInfo.color,
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        )}
                                                    </FormControl>

                                                    {/* Confirm Password */}
                                                    <FormControl fullWidth variant="outlined">
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mb: 0.5,
                                                                ml: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.8rem',
                                                                color: formState.touchedFields.confirmPassword ? PRIMARY_COLOR : 'text.secondary',
                                                            }}
                                                        >
                                                            Confirm Password
                                                        </Typography>
                                                        <TextField
                                                            {...register('confirmPassword')}
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            variant="outlined"
                                                            fullWidth
                                                            error={!!formState.errors.confirmPassword}
                                                            placeholder="Confirm your new password"
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleToggleConfirmPassword}
                                                                            onMouseDown={handleMouseDownPassword}
                                                                            edge="end"
                                                                            size="small"
                                                                        >
                                                                            {showConfirmPassword ? (
                                                                                <VisibilityOffOutlined fontSize="small" />
                                                                            ) : (
                                                                                <VisibilityOutlined fontSize="small" />
                                                                            )}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                                sx: {
                                                                    borderRadius: 1.5,
                                                                    bgcolor: '#fff',
                                                                    height: 45
                                                                }
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: formState.errors.confirmPassword
                                                                        ? theme.palette.error.main
                                                                        : formState.touchedFields.confirmPassword
                                                                            ? PRIMARY_COLOR
                                                                            : alpha('#000', 0.15),
                                                                    borderWidth: formState.errors.confirmPassword || formState.touchedFields.confirmPassword ? 1.5 : 1,
                                                                }
                                                            }}
                                                        />
                                                        {formState.errors.confirmPassword && (
                                                            <FormHelperText error>
                                                                {formState.errors.confirmPassword.message}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Paper>

                                                {/* Token Warning */}
                                                {!token && (
                                                    <Alert
                                                        severity="warning"
                                                        sx={{
                                                            mt: 2,
                                                            fontSize: '0.8rem',
                                                            '& .MuiAlert-icon': { fontSize: '1.2rem' }
                                                        }}
                                                    >
                                                        Reset token is missing. In production, this page should be accessed via a reset link sent to your email.
                                                    </Alert>
                                                )}
                                            </Grid>

                                            {/* Right column with requirements */}
                                            <Grid item xs={12} md={6}>
                                                <Box
                                                    sx={{
                                                        p: 2.5,
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                                        borderRadius: 1.5,
                                                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        boxShadow: `0 0 15px ${alpha('#000', 0.03)}`
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <ShieldIcon sx={{ color: PRIMARY_COLOR, mr: 1.5, fontSize: '1.2rem' }} />
                                                        <Typography variant="subtitle1" sx={{ color: PRIMARY_COLOR, fontWeight: 600, fontSize: '0.95rem' }}>
                                                            Password Requirements
                                                        </Typography>
                                                    </Box>

                                                    {/* Requirements intro */}
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                                                            Your password must meet the following requirements:
                                                        </Typography>
                                                    </Box>

                                                    {/* Individual requirements */}
                                                    <Stack spacing={1.5}>
                                                        <RequirementItem
                                                            text="At least 8 characters long"
                                                            fulfilled={hasMinLength}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one uppercase letter (A-Z)"
                                                            fulfilled={hasUppercase}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one lowercase letter (a-z)"
                                                            fulfilled={hasLowercase}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one number (0-9)"
                                                            fulfilled={hasNumber}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one special character (!@#$%^&*)"
                                                            fulfilled={hasSpecialChar}
                                                            active={isPasswordFieldActive}
                                                        />
                                                    </Stack>

                                                    {/* Password tips */}
                                                    <Box sx={{ mt: 'auto', pt: 2 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>
                                                            Tip: Create a unique password that you don't use for other websites.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Submit Button */}
                                        <Box sx={{ mt: 3 }}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                disabled={isSubmitting || !formState.isValid}
                                                sx={{
                                                    py: 1.2,
                                                    bgcolor: PRIMARY_COLOR,
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    position: 'relative',
                                                    boxShadow: '0 4px 12px rgba(8, 121, 108, 0.25)',
                                                    transition: 'all 0.3s ease-in-out',
                                                    height: 45,
                                                    '&:hover': {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                                        boxShadow: '0 6px 16px rgba(8, 121, 108, 0.35)',
                                                    },
                                                    '&:disabled': {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.6),
                                                        color: '#fff',
                                                    }
                                                }}
                                            >
                                                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </>
                            )}

                            {/* Footer */}
                            <Box sx={{ mt: 'auto', pt: 3 }}>
                                <Divider sx={{ mb: 1.5, opacity: 0.6 }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: alpha('#000', 0.6),
                                            display: 'block',
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        &copy; {currentYear} Pride Bank Limited.
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: alpha('#000', 0.5),
                                            fontSize: '0.65rem'
                                        }}
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

// Component for individual password requirements
const RequirementItem = ({ text, fulfilled, active = false }: RequirementItemProps) => {
    const color = active ? (fulfilled ? '#4caf50' : '#bdbdbd') : '#bdbdbd';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    mr: 1,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CheckCircleIcon sx={{ fontSize: '1rem' }} />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: active ? (fulfilled ? 'text.primary' : 'text.secondary') : 'text.secondary',
                    fontWeight: active && fulfilled ? 500 : 400,
                    fontSize: '0.8rem'
                }}
            >
                {text}
            </Typography>
        </Box>
    );
};

export default ResetPassword;