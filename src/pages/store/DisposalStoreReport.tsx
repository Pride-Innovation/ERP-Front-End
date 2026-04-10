import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

const DisposalStoreReport = () => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha('#000', 0.07)}`,
                bgcolor: '#fff',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.06)} 0%, ${alpha('#fff', 0)} 100%)`,
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.68rem', display: 'block' }}>Inventory</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Disposal Store Report</Typography>
                </Box>
            </Box>
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8, px: 3, gap: 1.5 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: alpha(theme.palette.error.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <InboxOutlinedIcon sx={{ fontSize: 24, color: alpha(theme.palette.error.main, 0.5) }} />
                </Box>
                <Typography variant="body2" color="text.disabled">No disposal store data available yet.</Typography>
            </Stack>
        </Paper>
    );
};

export default DisposalStoreReport;
