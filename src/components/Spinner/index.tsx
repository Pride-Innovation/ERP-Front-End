import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Spinner() {
    return (
        <Box sx={{
            display: 'flex',
            width: "100%",
            justifyContent: "center",
            height: " 100%",
            alignItems: "center"
        }}>
            <CircularProgress />
        </Box>
    );
}
