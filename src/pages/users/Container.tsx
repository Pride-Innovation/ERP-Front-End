import {
    alpha,
    Box,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { useContext } from 'react';
import { UserContext } from '../../context/user/UserContext';

const PRIMARY_COLOR = '#08796C';

const Container = ({ children }: { children: React.ReactNode }) => {
    const { totalUsers } = useContext(UserContext);

    return (
        <>
            <Box
                sx={{
                    p: 2.5,
                    mb: 2,
                    width: '100%',
                    maxWidth: '1500px',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                    <Grid item>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 2,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <PeopleOutlineIcon sx={{ fontSize: 22, color: PRIMARY_COLOR }} />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}
                                >
                                    Users Management
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Manage system access and user accounts
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid item>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: 2,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.06),
                                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                }}
                            >
                                <GroupsOutlinedIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{ color: PRIMARY_COLOR, lineHeight: 1 }}
                                    >
                                        {totalUsers}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        Total Users
                                    </Typography>
                                </Box>
                            </Box>
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