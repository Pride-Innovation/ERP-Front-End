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
    Chip
} from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import moment from "moment";
import { IUser } from "../users/interface";
import InfoItem from "./InfoItem";

// Brand colors
const PRIMARY_COLOR = '#08796C';

interface AccountInfoCardProps {
    user: IUser | null;
}

const AccountInfoCard = ({ user }: AccountInfoCardProps) => {
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
                        icon={<VerifiedUserIcon fontSize="small" />}
                        label="Account Status"
                        value={
                            <Chip
                                size="small"
                                label={user?.enabled ? "Active" : "Inactive"}
                                color={user?.enabled ? "success" : "default"}
                                sx={{ fontWeight: 500 }}
                            />
                        }
                    />

                    <InfoItem
                        icon={<LockIcon fontSize="small" />}
                        label="Account Lock Status"
                        value={
                            <Chip
                                size="small"
                                label={user?.accountNonLocked === false ? "Locked" : "Unlocked"}
                                color={user?.accountNonLocked === false ? "error" : "success"}
                                variant={user?.accountNonLocked === false ? "filled" : "outlined"}
                                sx={{ fontWeight: 500 }}
                            />
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