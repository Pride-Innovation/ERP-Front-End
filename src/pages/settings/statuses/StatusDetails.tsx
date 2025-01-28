import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { IStatusDetails } from './interface'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadingOutlinedIcon from '@mui/icons-material/DownloadingOutlined';

const StatusDetails = ({
    status,
    deleteStatus,
    updateStatus
}: IStatusDetails) => {
    return (
        <Card sx={{
            boxShadow: 0,
            p: 2,
            border: `2px solid ${grey[200]}`,
        }}>
            <Box
                sx={{ width: "100%", alignItems: "center" }}
                py={1.5}
            >
                <Typography noWrap variant="body2" sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <DownloadingOutlinedIcon fontSize="small" color="info" sx={{ mr: "4px", fontSize: "16px" }} />
                    Status
                </Typography>
            </Box>
            <Stack
                direction="column"
                spacing={2}
                sx={{
                    pt: 3,
                    borderTop: `2px solid ${grey[200]}`,
                    alignItems: "center",
                    height: "100%"
                }} >
                <Typography variant="caption" sx={{ fontWeight: 400, textAlign: "center" }}>
                    {status.name}
                </Typography>
                <Button
                    onClick={() => updateStatus(status)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                <Button
                    onClick={() => deleteStatus(status)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
            </Stack>
        </Card >
    )
}

export default StatusDetails