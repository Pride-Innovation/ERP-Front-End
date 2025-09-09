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
    alpha,
    Chip,
    Tooltip
} from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BlockIcon from '@mui/icons-material/Block';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import moment from "moment";
import { IUser } from "../users/interface";
import InfoItem from "./InfoItem";

// Brand colors
const PRIMARY_COLOR = '#08796C';

interface AccountInfoCardProps {
    user: IUser | null;
}

const AccountInfoCard = ({ user }: AccountInfoCardProps) => {

    /**
     * Returns account status with appropriate visual indicators based on status hierarchy:
     * 1. Disabled (highest priority) - User has left the organization
     * 2. Locked - New account needing password change
     * 3. Blocked - User temporarily away (e.g., on leave)
     * 4. Active - Normal active account
     */
    const getAccountStatus = () => {
        if (!user) return {
            status: "Unknown",
            color: "default",
            icon: <VerifiedUserIcon fontSize="small" />,
            tooltip: "Account status unknown"
        };

        // Disabled status (highest priority) - User has left organization
        if (user.enabled === false) return {
            status: "Disabled",
            color: "error",
            icon: <NotInterestedIcon fontSize="small" />,
            tooltip: "User has left the organization"
        };

        // Locked status - New account or security lockout
        if (user.accountNonLocked === false) return {
            status: "Locked",
            color: "warning",
            icon: <LockIcon fontSize="small" />,
            tooltip: "Account needs password change or has been locked for security"
        };

        // Blocked status - Temporary absence (e.g., on leave)
        if (user.blocked) return {
            status: "Blocked",
            color: "info",
            icon: <BlockIcon fontSize="small" />,
            tooltip: "User is temporarily away"
        };

        // Active status - Normal functioning account
        return {
            status: "Active",
            color: "success",
            icon: <CheckCircleIcon fontSize="small" />,
            tooltip: "Account is active and functioning normally"
        };
    };

    const accountStatus = getAccountStatus();

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
                    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                    bgcolor: alpha(PRIMARY_COLOR, 0.03)
                }}
            >
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
                    <SecurityIcon fontSize="small" />
                </Box>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    Account Information
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                    <InfoItem
                        icon={accountStatus.icon}
                        label="Account Status"
                        value={
                            <Tooltip title={accountStatus.tooltip}>
                                <Chip
                                    size="small"
                                    label={accountStatus.status}
                                    color={accountStatus.color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Tooltip>
                        }
                    />

                    <InfoItem
                        icon={user?.accountNonLocked ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                        label="Account Lock Status"
                        value={
                            <Tooltip title={user?.accountNonLocked ? "Account is unlocked and accessible" : "Account is locked and requires password reset"}>
                                <Chip
                                    size="small"
                                    label={user?.accountNonLocked === false ? "Locked" : "Unlocked"}
                                    color={user?.accountNonLocked === false ? "warning" : "success"}
                                    variant={user?.accountNonLocked === false ? "filled" : "outlined"}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Tooltip>
                        }
                    />

                    <InfoItem
                        icon={<CalendarTodayIcon fontSize="small" />}
                        label="Created Date"
                        value={user?.createDate ? moment(user.createDate).format('MMMM Do, YYYY') : 'Not available'}
                    />

                    <InfoItem
                        icon={<PersonOutlineIcon fontSize="small" />}
                        label="Created By"
                        value={user?.createdBy ? `${user.createdBy.firstName} ${user.createdBy.lastName}` : 'System'}
                    />

                    {user?.lastModified && (
                        <InfoItem
                            icon={<CalendarTodayIcon fontSize="small" />}
                            label="Last Modified"
                            value={moment(user.lastModified).format('MMMM Do, YYYY')}
                        />
                    )}

                    {user?.lastModifiedBy && (
                        <InfoItem
                            icon={<PersonOutlineIcon fontSize="small" />}
                            label="Modified By"
                            value={`${user.lastModifiedBy.firstName} ${user.lastModifiedBy.lastName}`}
                        />
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

export default AccountInfoCard;