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

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold/Amber

const Container = ({ children }: { children: React.ReactNode }) => {
    const { totalUsers } = useContext(UserContext);

    return (
        <>
            <Card sx={{ p: 1.5, mb: 2, width: '100%' }}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <PeopleOutlineIcon fontSize='small' sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="500" color="primary">
                                Users
                            </Typography>
                        </Stack>
                    </Grid>

                    <Grid item>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{
                                px: 2,
                                py: 0.75,
                                borderLeft: `3px solid ${SECONDARY_COLOR}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.03),
                                borderRadius: '0 4px 4px 0'
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                }}
                            >
                                Total Users:
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="700"
                                color={PRIMARY_COLOR}
                            >
                                {totalUsers}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Card>

            <Box sx={{ position: 'relative', width: '100%' }}>
                {children}
            </Box>
        </>
    )
}

export default Container