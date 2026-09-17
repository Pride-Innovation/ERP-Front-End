/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBack';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { ROUTES } from '../../core/routes/routes';

/**
 * What the application shows when a route does not exist or a page throws.
 *
 * <h2>What stood here before</h2>
 * Nothing. `createBrowserRouter` was built with no `errorElement` and no catch-all route, so React
 * Router fell back to its own developer page:
 *
 * <pre>
 *   Unexpected Application Error!
 *   404 Not Found
 *   💿 Hey developer 👋
 *   You can provide a way better UX than this…
 * </pre>
 *
 * <p>That is a message written for whoever built the application, shown to whoever is using it — and
 * it is the only thing they get: no navigation, no way back, and the surrounding shell gone. Any
 * mistyped URL, any stale bookmark, any bug in a page reached it.
 *
 * <h2>Two different situations, deliberately worded differently</h2>
 * A **404** is almost always a link or a bookmark that has aged, and the honest thing to say is that
 * the address does not exist — not "something went wrong", which invites the reader to retry the
 * thing that cannot work. Anything else is a **fault**: the page threw, the user did nothing wrong,
 * and retrying is a reasonable first move.
 *
 * <p>The underlying message is shown for a fault and not for a 404, because a stack trace tells a
 * reader nothing about a URL that does not exist while it is the one useful detail to quote when
 * reporting a real break.
 */
const RouteError = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    const notFound = isRouteErrorResponse(error) && error.status === 404;

    const detail = isRouteErrorResponse(error)
        ? error.statusText || `${error.status}`
        : error instanceof Error
            ? error.message
            : null;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 3 },
                py: 6,
                bgcolor: 'grey.50',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 520,
                    width: '100%',
                    p: { xs: 3, sm: 4.5 },
                    borderRadius: '16px',
                    border: 1,
                    borderColor: 'border.subtle',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        mx: 'auto',
                        mb: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: notFound ? 'grey.100' : 'error.50',
                        color: notFound ? 'text.secondary' : 'error.main',
                    }}
                >
                    {notFound
                        ? <SearchOffOutlinedIcon sx={{ fontSize: 30 }} />
                        : <ErrorOutlineOutlinedIcon sx={{ fontSize: 30 }} />}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {notFound ? 'This page does not exist' : 'Something went wrong on this page'}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                    {notFound
                        ? 'The address may have been mistyped, or the link that brought you here may be out of date.'
                        : 'The page could not be displayed. Going back usually works; if it keeps happening, quote the detail below.'}
                </Typography>

                {!notFound && detail && (
                    <Typography
                        variant="caption"
                        component="p"
                        sx={{
                            display: 'block',
                            mb: 3,
                            px: 1.5,
                            py: 1.25,
                            borderRadius: '8px',
                            bgcolor: 'grey.100',
                            color: 'text.secondary',
                            fontFamily: 'monospace',
                            wordBreak: 'break-word',
                        }}
                    >
                        {detail}
                    </Typography>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Go back
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<HomeOutlinedIcon />}
                        onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Back to dashboard
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default RouteError;
