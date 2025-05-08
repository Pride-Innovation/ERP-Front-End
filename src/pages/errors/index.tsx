/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const UnauthorizedPage: React.FC = () => {
    return (
        <Container
            maxWidth="md"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 4
            }}
        >
            <BlockIcon sx={{ fontSize: 100, color: 'error.main' }} />
            <Typography variant="h4" component="h1" gutterBottom>
                Unauthorized Access
            </Typography>
            <Typography variant="body1" gutterBottom>
                You do not have permission to view this page. Please log in to continue.
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    href="/login"
                    size="large"
                >
                    Go to Login
                </Button>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;
