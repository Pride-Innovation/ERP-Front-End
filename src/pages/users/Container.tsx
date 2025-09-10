import {
    alpha,
    Box,
    Card,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold/Amber

const Container = ({ children }: { children: React.ReactNode }) => {
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
                        <Box
                            sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 1.5,
                                border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.03),
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: `0 1px 3px ${alpha('#000', 0.03)}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: 3,
                                    height: '100%',
                                    bgcolor: SECONDARY_COLOR,
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: PRIMARY_COLOR,
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 0.75,
                                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Total Users
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="#fff"
                                    sx={{
                                        bgcolor: PRIMARY_COLOR,
                                        px: 1.5,
                                        py: 0.25,
                                        borderRadius: 1,
                                        minWidth: '65px',
                                        textAlign: 'center',
                                    }}
                                >
                                    1,458
                                </Typography>
                            </Box>
                        </Box>
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