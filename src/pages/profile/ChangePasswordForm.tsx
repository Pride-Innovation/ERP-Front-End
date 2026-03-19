/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    FormControl,
    FormHelperText,
    Grid,
    Stack,
    Box,
    Typography,
    alpha,
    LinearProgress,
    Paper,
    IconButton,
    Tooltip,
    InputAdornment,
    TextField,
    Button,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { IIChangePasswordForm, RequirementItemProps } from './interface';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useMemo } from 'react';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const passwordFieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(PRIMARY_COLOR, 0.5),
        },
        '&.Mui-focused': {
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: PRIMARY_COLOR,
                borderWidth: '1.5px',
                boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.09)}`,
            },
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D32F2F',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.18)',
    },
    '& .MuiOutlinedInput-input': {
        padding: '13px 14px',
        fontSize: '0.875rem',
        lineHeight: 1.5,
    },
};

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

const ChangePasswordForm = ({
    formState,
    control,
    register,
    buttonText,
    showOldPassword,
    showNewPassword,
    showConfirmPassword,
    sendingRequest,
    handleClickShowOldPassword,
    handleClickShowNewPassword,
    handleClickShowConfirmPassword,
    handleMouseDownPassword,
    handleClose,
    getValues,
    watch
}: IIChangePasswordForm) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Watch the newPassword field for real-time updates
    const newPassword = watch('newPassword') || '';

    // Calculate password strength based on the watched value
    const passwordStrength = useMemo(() => {
        return calculatePasswordStrength(newPassword);
    }, [newPassword]);

    const strengthInfo = getStrengthInfo(passwordStrength);

    // Password requirement checks - use the watched value directly
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);

    // Check if field has been interacted with
    const isPasswordFieldActive = formState.touchedFields.newPassword || newPassword.length > 0;


    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.03),
                    p: 3,
                    display: 'flex',
                    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                }}
            >
                <Box
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.12),
                        color: PRIMARY_COLOR,
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        mr: 2
                    }}
                >
                    <LockIcon />
                </Box>

                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            mb: 0.5
                        }}
                    >
                        Change Your Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        For security, please enter your current password before setting a new one
                    </Typography>
                </Box>
            </Box>

            {/* Form Content - Two column layout */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Left Column - Form Fields */}
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={3}>
                            {/* Old Password */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    Current Password
                                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Controller
                                        control={control}
                                        {...register("oldPassword")}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                placeholder="Enter your current password"
                                                type={showOldPassword ? 'text' : 'password'}
                                                error={!!formState.errors.oldPassword}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowOldPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                                edge="end"
                                                            >
                                                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                size="medium"
                                                fullWidth
                                                sx={passwordFieldSx}
                                            />
                                        )}
                                    />
                                    {formState.errors.oldPassword && (
                                        <FormHelperText error>{formState.errors.oldPassword.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* Divider with text */}
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mt: 1,
                                        mb: 2
                                    }}
                                >
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#000', 0.1) }} />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            px: 2,
                                            color: 'text.secondary',
                                            fontWeight: 500
                                        }}
                                    >
                                        CREATE NEW PASSWORD
                                    </Typography>
                                    <Box sx={{ flex: 1, height: '1px', bgcolor: alpha('#000', 0.1) }} />
                                </Box>
                            </Grid>

                            {/* New Password */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            mr: 1
                                        }}
                                    >
                                        New Password
                                        <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                    </Typography>
                                    <Tooltip title="Password must be at least 8 characters and include uppercase, lowercase, numbers and special characters">
                                        <InfoIcon sx={{ fontSize: 16, color: alpha('#000', 0.5), ml: 0.5 }} />
                                    </Tooltip>
                                </Box>
                                <FormControl fullWidth variant="outlined">
                                    <Controller
                                        control={control}
                                        {...register("newPassword")}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                placeholder="Create a strong password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                error={!!formState.errors.newPassword}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowNewPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                                edge="end"
                                                            >
                                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                size="medium"
                                                fullWidth
                                                sx={passwordFieldSx}
                                            />
                                        )}
                                    />
                                    {formState.errors.newPassword ? (
                                        <FormHelperText error>{formState.errors.newPassword.message}</FormHelperText>
                                    ) : formState.dirtyFields.newPassword && (
                                        <Box sx={{ mt: 1.5, mb: 0.5 }}>
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
                            </Grid>

                            {/* Confirm Password */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    Confirm Password
                                    <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>
                                </Typography>
                                <FormControl fullWidth variant="outlined">
                                    <Controller
                                        control={control}
                                        {...register("confirmPassword")}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                placeholder="Repeat your new password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                error={!!formState.errors.confirmPassword}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowConfirmPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                                edge="end"
                                                            >
                                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                size="medium"
                                                fullWidth
                                                sx={passwordFieldSx}
                                            />
                                        )}
                                    />
                                    {formState.errors.confirmPassword && (
                                        <FormHelperText error>{formState.errors.confirmPassword.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Column - Password Requirements */}
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
                                <ShieldIcon sx={{ color: PRIMARY_COLOR, mr: 1.5 }} />
                                <Typography variant="subtitle1" sx={{ color: PRIMARY_COLOR, fontWeight: 600 }}>
                                    Password Requirements
                                </Typography>
                            </Box>

                            {/* Requirements list */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                    Your password must meet the following requirements:
                                </Typography>
                            </Box>

                            {/* Individual requirements with checkmarks */}
                            <Stack spacing={1.5}>
                                <RequirementItem
                                    text="At least 8 characters long"
                                    fulfilled={hasMinLength}
                                    active={isPasswordFieldActive} // Use the new active check
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

                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Buttons */}
            <Box sx={{
                p: 3,
                borderTop: `1px solid ${alpha('#000', 0.08)}`,
                bgcolor: alpha('#f5f5f5', 0.5),
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        sx={{
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            minWidth: { xs: '100%', sm: 110 },
                            '&:hover': {
                                borderColor: alpha('#000', 0.3),
                                bgcolor: alpha('#000', 0.05)
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={sendingRequest}
                        sx={{
                            bgcolor: PRIMARY_COLOR,
                            minWidth: { xs: '100%', sm: 110 },
                            '&:hover': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.9)
                            }
                        }}
                    >
                        {sendingRequest ? 'Updating...' : buttonText}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}

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
                <CheckCircleIcon fontSize="small" />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: active ? (fulfilled ? 'text.primary' : 'text.secondary') : 'text.secondary',
                    fontWeight: active && fulfilled ? 500 : 400,
                }}
            >
                {text}
            </Typography>
        </Box>
    );
}

export default ChangePasswordForm;