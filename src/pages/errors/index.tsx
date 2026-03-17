/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import { Box, Typography, Button, Container, alpha } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const PRIMARY_COLOR = '#08796C';

const UnauthorizedPage: React.FC = () => {
    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '70vh',
                py: 8
            }}
        >
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha('#f44336', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: `2px solid ${alpha('#f44336', 0.2)}`,
                }}
            >
                <LockOutlinedIcon sx={{ fontSize: 48, color: 'error.main' }} />
            </Box>

            <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                color="text.primary"
                gutterBottom
            >
                Access Denied
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 1, maxWidth: 400 }}>
                You don't have permission to view this page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                Please contact your administrator or log in with an authorized account.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    href="/login"
                    size="large"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        borderRadius: 1.5,
                        boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                    }}
                >
                    Go to Login
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.history.back()}
                    size="large"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        borderRadius: 1.5,
                    }}
                >
                    Go Back
                </Button>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;
