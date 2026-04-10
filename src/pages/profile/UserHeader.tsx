/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Badge,
    Avatar,
    alpha,
    Chip,
    IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { IUser } from "../users/interface";


// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

interface UserHeaderProps {
    user: IUser | null;
    userImage: string;
    isCurrentUser: boolean;
    onUpdateImage: () => void;
    onUpdateAvailability: () => void;
    onChangePassword: () => void;
}

const UserHeader = ({
    user,
    userImage,
    isCurrentUser,
    onUpdateImage,
    onUpdateAvailability,
    onChangePassword
}: UserHeaderProps) => {
    // const theme = useTheme();
    // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Determine availability status
    const isAvailable = user?.availability === 'present';

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            {/* Header accent bar */}
            <Box sx={{ height: 4, bgcolor: PRIMARY_COLOR }} />

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'center', sm: 'flex-start' },
                        gap: 3,
                    }}
                >
                    {/* Profile Photo Section */}
                    <Box sx={{ position: 'relative' }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                isCurrentUser ? (
                                    <IconButton
                                        onClick={onUpdateImage}
                                        sx={{
                                            bgcolor: PRIMARY_COLOR,
                                            color: 'white',
                                            width: 36,
                                            height: 36,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            '&:hover': {
                                                bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                            }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                ) : null
                            }
                        >
                            <Avatar
                                src={userImage}
                                alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                                sx={{
                                    width: { xs: 100, sm: 120 },
                                    height: { xs: 100, sm: 120 },
                                    border: `3px solid ${isAvailable ? '#4caf50' : '#ff9800'}`,
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                                }}
                            />
                        </Badge>

                        <Chip
                            size="small"
                            label={isAvailable ? "Available" : "Away"}
                            color={isAvailable ? "success" : "warning"}
                            sx={{
                                position: 'absolute',
                                bottom: -6,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontWeight: 500,
                            }}
                        />
                    </Box>

                    {/* User Details Section */}
                    <Box sx={{
                        flex: 1,
                        textAlign: { xs: 'center', sm: 'left' },
                        mt: { xs: 1, sm: 0 }
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                color: 'text.primary',
                            }}
                        >
                            {user?.firstName} {user?.lastName}
                            {user?.otherName && ` ${user.otherName}`}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: PRIMARY_COLOR,
                                fontWeight: 500,
                                mb: 1,
                            }}
                        >
                            {user?.title?.name || 'No Title'}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                mb: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: { xs: 'center', sm: 'flex-start' },
                                gap: 0.5,
                            }}
                        >
                            <Box component="span" sx={{ fontWeight: 600 }}>Staff ID:</Box> {user?.staffNumber || 'N/A'}
                        </Typography>

                        {/* Action Buttons for current user */}
                        {isCurrentUser && (
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{ mt: { xs: 2, sm: 0 } }}
                            >
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<LockIcon />}
                                    onClick={onChangePassword}
                                    sx={{
                                        borderColor: alpha(PRIMARY_COLOR, 0.5),
                                        color: PRIMARY_COLOR,
                                        '&:hover': {
                                            borderColor: PRIMARY_COLOR,
                                            bgcolor: alpha(PRIMARY_COLOR, 0.05),
                                        }
                                    }}
                                >
                                    Change Password
                                </Button>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<EventAvailableIcon />}
                                    onClick={onUpdateAvailability}
                                    sx={{
                                        borderColor: alpha(SECONDARY_COLOR, 0.5),
                                        color: SECONDARY_COLOR,
                                        '&:hover': {
                                            borderColor: SECONDARY_COLOR,
                                            bgcolor: alpha(SECONDARY_COLOR, 0.05),
                                        }
                                    }}
                                >
                                    Update Availability
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default UserHeader;