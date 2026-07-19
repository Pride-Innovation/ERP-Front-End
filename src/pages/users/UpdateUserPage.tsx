/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import { PageShell } from '../../components/layout';
import { brand } from '../../utils/tokens';
import UpdateUsers from './UpdateUsers';

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

    // Navigation away from a dirty form (including this header's links) is
    // intercepted by the useBlocker inside UpdateUsers — plain navigate is fine here.
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageShell
                title="Update User Account"
                subtitle={`Update personal details, duty station and account information for ${user.firstName} ${user.lastName}`}
                icon={<ManageAccountsOutlinedIcon />}
                breadcrumbs={[
                    { label: 'Home', onClick: () => navigate(ROUTES.ASSETS_MANAGEMENT) },
                    { label: 'Users', onClick: () => navigate(ROUTES.USERS) },
                    { label: `Edit — ${user.firstName} ${user.lastName}` },
                ]}
                actions={
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        onClick={() => navigate(ROUTES.USERS)}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '8px',
                            borderColor: alpha(brand[500], 0.4),
                            color: brand[600],
                            '&:hover': { borderColor: brand[500], bgcolor: alpha(brand[500], 0.05) },
                        }}
                    >
                        Back to Users
                    </Button>
                }
            >
                <UpdateUsers
                    user={user}
                    handleClose={() => navigate(ROUTES.USERS)}
                    sendingRequest={sendingRequest}
                    setSendingRequest={setSendingRequest}
                />
            </PageShell>
        </Box>
    );
};

export default UpdateUserPage;
