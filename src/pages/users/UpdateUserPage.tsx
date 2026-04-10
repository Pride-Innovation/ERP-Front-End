/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Breadcrumbs, Chip, Link, Stack, Typography, alpha } from '@mui/material';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import UpdateUsers from './UpdateUsers';

const PRIMARY_COLOR = '#08796C';

const UpdateUserPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { users } = useSelector((state: RootState) => state.UserStore);

    const user = users.find(u => String(u.id) === id);

    // If user not in store (e.g. direct URL access), redirect to list
    if (!user) {
        return <Navigate to={ROUTES.USERS} replace />;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page Nav Bar ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    {/* Back button */}
                    <Box
                        onClick={() => navigate(ROUTES.USERS)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            cursor: 'pointer',
                            color: alpha(PRIMARY_COLOR, 0.85),
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            px: 1.5,
                            py: 0.6,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.22)}`,
                            bgcolor: alpha(PRIMARY_COLOR, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.09),
                                borderColor: alpha(PRIMARY_COLOR, 0.4),
                                color: PRIMARY_COLOR,
                            },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Users
                        </Typography>
                    </Box>

                    {/* Breadcrumb */}
                    <Breadcrumbs
                        separator="›"
                        sx={{
                            '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 },
                            display: { xs: 'none', sm: 'flex' },
                        }}
                    >
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />
                            Home
                        </Link>
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.USERS)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <PeopleOutlinedIcon sx={{ fontSize: 14 }} />
                            Users
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>
                            Edit — {user.firstName} {user.lastName}
                        </Typography>
                    </Breadcrumbs>
                </Stack>

                {/* Page badge */}
                <Chip
                    icon={<ManageAccountsOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Editing: ${user.firstName} ${user.lastName}`}
                    size="small"
                    sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: alpha('#0369a1', 0.07),
                        color: '#0369a1',
                        border: `1px solid ${alpha('#0369a1', 0.2)}`,
                        '& .MuiChip-icon': { color: '#0369a1' },
                    }}
                />
            </Box>

            {/* ── Form ── */}
            <UpdateUsers
                user={user}
                handleClose={() => navigate(ROUTES.USERS)}
                sendingRequest={sendingRequest}
                setSendingRequest={setSendingRequest}
            />
        </Box>
    );
};

export default UpdateUserPage;
