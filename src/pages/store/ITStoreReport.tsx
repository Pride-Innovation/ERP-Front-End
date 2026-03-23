import { Paper, Typography } from '@mui/material';

const ITStoreReport = () => (
    <Paper elevation={0} sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        minHeight: 300,
        bgcolor: '#fff',
        border: '1.5px solid rgba(8,121,108,0.07)',
        boxShadow: '0 2px 8px rgba(8,121,108,0.04)',
        mb: 2
    }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', letterSpacing: '0.04em' }}>
            IT Store Report
        </Typography>
        {/* IT Store content goes here */}
        <Typography color="text.secondary">No data available yet.</Typography>
    </Paper>
);

export default ITStoreReport;
