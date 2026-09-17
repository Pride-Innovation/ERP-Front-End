/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../core/routes/routes';
import { PageShell } from '../../components/layout';
import { brand } from '../../utils/tokens';
import CreateUser from './CreateUser';

const CreateUserPage = () => {
    const navigate = useNavigate();

    // Navigation away from a dirty form (including this header's links) is
    // intercepted by the useBlocker inside CreateUser — plain navigate is fine here.
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <PageShell
                title="Create New User"
                subtitle="Provide the user's details — a verification email is sent on creation"
                icon={<PersonAddOutlinedIcon />}
                breadcrumbs={[
                    { label: 'Home', onClick: () => navigate(ROUTES.ASSETS_MANAGEMENT) },
                    { label: 'Users', onClick: () => navigate(ROUTES.USERS) },
                    { label: 'Create User' },
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
                <CreateUser handleClose={() => navigate(ROUTES.USERS)} />
            </PageShell>
        </Box>
    );
};

export default CreateUserPage;
