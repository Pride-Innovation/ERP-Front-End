import {
    alpha,
    Box,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useContext } from 'react';
import { InventoryContext } from '../../context/inventory';

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold/Amber

const Container = ({ children }: { children: React.ReactNode }) => {
    const { inventoryCount } = useContext(InventoryContext)

    return (
        <>
            <Box
                sx={{
                    p: 1.75,
                    mb: 2,
                    width: '100%',
                    maxWidth: '1500px',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
            >
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Inventory2OutlinedIcon fontSize='small' />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem' }}>
                                    Management
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                    Stocks
                                </Typography>
                            </Box>
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
                                bgcolor: alpha(SECONDARY_COLOR, 0.06),
                                borderRadius: '0 6px 6px 0',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                }}
                            >
                                Total Stocking:
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                color={PRIMARY_COLOR}
                            >
                                {inventoryCount}
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
                maxWidth: "1500px"
            }}>
                {children}
            </Box>
        </>
    )
}

export default Container