/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { alpha, Box, CircularProgress, Stack, Typography } from "@mui/material"

const Loading = ({ items }: { items: string }) => {
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ minHeight: 300 }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress
                    size={48}
                    thickness={3}
                    sx={{ color: '#08796C' }}
                />
                <CircularProgress
                    size={48}
                    thickness={3}
                    sx={{
                        color: alpha('#BC892C', 0.3),
                        position: 'absolute',
                    }}
                    variant="determinate"
                    value={100}
                />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    letterSpacing: 0.2,
                }}
            >
                Loading {items}...
            </Typography>
        </Stack>
    );
};

export default Loading;