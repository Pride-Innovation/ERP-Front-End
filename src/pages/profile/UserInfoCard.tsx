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
    alpha,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WcIcon from '@mui/icons-material/Wc';
import { IUser } from "../users/interface";
import InfoItem from "./InfoItem";


// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
// const SECONDARY_COLOR = '#BC892C'; // Gold

interface UserInfoCardProps {
    user: IUser | null;
    isCurrentUser: boolean;
    onUpdateProfile: () => void;
}

const UserInfoCard = ({
    user,
    isCurrentUser,
    onUpdateProfile
}: UserInfoCardProps) => {
    // const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            {/* Section header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                    bgcolor: alpha(PRIMARY_COLOR, 0.03)
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            mr: 1.5
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                        }}
                    >
                        Personal Information
                    </Typography>
                </Box>

                {isCurrentUser && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={onUpdateProfile}
                        sx={{
                            borderColor: alpha(PRIMARY_COLOR, 0.5),
                            color: PRIMARY_COLOR,
                            '&:hover': {
                                borderColor: PRIMARY_COLOR,
                                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                            }
                        }}
                    >
                        Edit
                    </Button>
                )}
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                    <InfoItem
                        icon={<PersonIcon fontSize="small" />}
                        label="Full Name"
                        value={`${user?.firstName || ''} ${user?.lastName || ''} ${user?.otherName || ''}`}
                    />

                    <InfoItem
                        icon={<EmailIcon fontSize="small" />}
                        label="Email Address"
                        value={user?.email || 'Not specified'}
                        copyable
                    />

                    <InfoItem
                        icon={<WcIcon fontSize="small" />}
                        label="Gender"
                        value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
                    />

                    <InfoItem
                        icon={<PersonIcon fontSize="small" />}
                        label="Title"
                        value={user?.title?.name || 'Not specified'}
                    />
                </Stack>
            </Box>
        </Paper>
    );
};

export default UserInfoCard;