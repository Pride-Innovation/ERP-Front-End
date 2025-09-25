import {
    alpha,
    Box,
    Card,
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
            <Card sx={{ p: 1.5, mb: 2, width: '100%', maxWidth: "1500px" }}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Inventory2OutlinedIcon fontSize='small' sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="500" color="primary">
                                Stocks
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
                                Total Stocking:
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight="700"
                                color={PRIMARY_COLOR}
                            >
                                {inventoryCount}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Card>

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