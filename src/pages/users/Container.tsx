import {
    alpha,
    Box,
    Card,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { useContext } from 'react';
import { UserContext } from '../../context/user/UserContext';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const Container = ({ children }: { children: React.ReactNode }) => {
    const { totalUsers } = useContext(UserContext);

    return (
        <>
            <Box
                sx={{
                    p: 2,
                    mb: 2,
                    width: '100%',
                    maxWidth: '1500px',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <PeopleOutlineIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                            </Box>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{ color: PRIMARY_COLOR, letterSpacing: 0.2 }}
                            >
                                Users Management
                            </Typography>
                        </Stack>
                    </Grid>

                    <Grid item>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{
                                px: 2,
                                py: 0.75,
                                borderLeft: `3px solid ${SECONDARY_COLOR}`,
                                bgcolor: alpha(SECONDARY_COLOR, 0.05),
                                borderRadius: '0 6px 6px 0',
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Total Users
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ color: PRIMARY_COLOR, lineHeight: 1 }}
                            >
                                {totalUsers}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                maxWidth: '1500px',
            }}>
                {children}
            </Box>
        </>
    );
};

export default Container;