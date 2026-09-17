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
    IconButton,
    Tooltip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IUser } from "../users/interface";
import StatusChip, { StatusTone } from "../../components/layout/StatusChip";
import { brand, neutral, border, elevation, radii } from "../../utils/tokens";

interface UserHeaderProps {
    user: IUser | null;
    userImage: string;
    isCurrentUser: boolean;
    onUpdateImage: () => void;
    onUpdateAvailability: () => void;
    onChangePassword: () => void;
}

/** One meta-row entry: small icon + value. Renders nothing when value is empty. */
const MetaItem = ({ icon, value }: { icon: React.ReactNode; value?: string | null }) => {
    if (!value) return null;
    return (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', color: neutral[400], '& .MuiSvgIcon-root': { fontSize: 16 } }}>
                {icon}
            </Box>
            <Typography variant="body2" sx={{ color: neutral[600], whiteSpace: 'nowrap' }} noWrap>
                {value}
            </Typography>
        </Stack>
    );
};

/** Account standing — shown to admins viewing someone else's profile. */
const accountState = (user: IUser | null): { label: string; tone: StatusTone } => {
    if (user?.blocked) return { label: 'Blocked', tone: 'danger' };
    if (user?.enabled === false) return { label: 'Disabled', tone: 'neutral' };
    if (user?.accountNonLocked === false) return { label: 'Locked', tone: 'pending' };
    return { label: 'Active', tone: 'success' };
};

const UserHeader = ({
    user,
    userImage,
    isCurrentUser,
    onUpdateImage,
    onUpdateAvailability,
    onChangePassword
}: UserHeaderProps) => {
    const isAvailable = user?.availability === 'present';
    const account = accountState(user);

    const fullName = [user?.firstName, user?.lastName, user?.otherName]
        .filter(Boolean)
        .join(' ');

    const unitName =
        user?.unit && typeof user.unit === 'object' ? user.unit.name : null;
    const departmentLine = [user?.department?.name, unitName].filter(Boolean).join(' · ');

    const memberSince = user?.createDate
        ? new Date(user.createDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: `${radii.lg}px`,
                border: `1px solid ${border.subtle}`,
                bgcolor: '#fff',
                boxShadow: elevation.card,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'center', md: 'flex-start' },
                        gap: { xs: 2.5, md: 3 },
                    }}
                >
                    {/* ── Avatar ── */}
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            isCurrentUser ? (
                                <Tooltip title="Update profile photo" arrow>
                                    <IconButton
                                        onClick={onUpdateImage}
                                        sx={{
                                            bgcolor: brand[500],
                                            color: '#fff',
                                            width: 32,
                                            height: 32,
                                            border: '2px solid #fff',
                                            boxShadow: elevation.raised,
                                            '&:hover': { bgcolor: brand[700] },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            ) : null
                        }
                    >
                        <Avatar
                            src={userImage}
                            alt={fullName || 'User profile photo'}
                            sx={{
                                width: { xs: 96, md: 104 },
                                height: { xs: 96, md: 104 },
                                border: '3px solid #fff',
                                boxShadow: `0 0 0 1px ${border.default}, ${elevation.card}`,
                            }}
                        />
                    </Badge>

                    {/* ── Identity ── */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            textAlign: { xs: 'center', md: 'left' },
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.25}
                            sx={{
                                flexWrap: 'wrap',
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                rowGap: 0.75,
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: neutral[900],
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.2,
                                }}
                            >
                                {fullName || 'Unnamed User'}
                            </Typography>

                            <StatusChip
                                label={isAvailable ? 'Available' : 'Away'}
                                tone={isAvailable ? 'success' : 'pending'}
                                icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
                            />

                            {!isCurrentUser && (
                                <StatusChip
                                    label={account.label}
                                    tone={account.tone}
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        <Typography
                            variant="body1"
                            sx={{ color: brand[600], fontWeight: 600, mt: 0.5 }}
                        >
                            {user?.title?.name || 'No Title'}
                        </Typography>

                        {/* Meta row — who/where/how-to-reach at a glance */}
                        <Stack
                            direction="row"
                            sx={{
                                mt: 1.5,
                                flexWrap: 'wrap',
                                columnGap: 2.5,
                                rowGap: 1,
                                justifyContent: { xs: 'center', md: 'flex-start' },
                            }}
                        >
                            <MetaItem icon={<EmailOutlinedIcon />} value={user?.email} />
                            <MetaItem icon={<BusinessOutlinedIcon />} value={user?.branch?.name} />
                            <MetaItem icon={<AccountTreeOutlinedIcon />} value={departmentLine || null} />
                            <MetaItem icon={<BadgeOutlinedIcon />} value={user?.staffNumber ? `Staff No. ${user.staffNumber}` : null} />
                            <MetaItem icon={<CalendarTodayOutlinedIcon />} value={memberSince ? `Member since ${memberSince}` : null} />
                        </Stack>
                    </Box>

                    {/* ── Actions (current user only) ── */}
                    {isCurrentUser && (
                        <Stack
                            direction={{ xs: 'row', md: 'column' }}
                            spacing={1.25}
                            sx={{
                                flexShrink: 0,
                                width: { xs: '100%', md: 'auto' },
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                flexWrap: 'wrap',
                            }}
                        >
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                                onClick={onChangePassword}
                                sx={{
                                    height: 36,
                                    px: 2,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: alpha(brand[500], 0.4),
                                    color: brand[600],
                                    whiteSpace: 'nowrap',
                                    '&:hover': { borderColor: brand[500], bgcolor: alpha(brand[500], 0.05) },
                                }}
                            >
                                Change Password
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />}
                                onClick={onUpdateAvailability}
                                sx={{
                                    height: 36,
                                    px: 2,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: border.default,
                                    color: neutral[600],
                                    whiteSpace: 'nowrap',
                                    '&:hover': { borderColor: neutral[400], bgcolor: neutral[50] },
                                }}
                            >
                                Update Availability
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default UserHeader;
