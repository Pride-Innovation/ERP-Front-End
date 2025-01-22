import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import React from 'react';
import { IBranch } from '../../assets/ITEquipment/interface';

const ViewBranch: React.FC<{ branch: IBranch }> = ({ branch }) => {
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
                    <CameraOutdoorOutlinedIcon fontSize="small" color="info" sx={{ mr: "4px" }} />
                    {branch.name}
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
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "center" }}>
                    Contact
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 400, textAlign: "center" }}>
                    {branch.email}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 400, textAlign: "center" }}>
                    {/* {branch.tel} */}
                    +256777338787
                </Typography>
                <Button
                    onClick={() => console.log(branch.id)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                <Button
                    onClick={() => console.log(branch.id)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
            </Stack>
        </Card >
    )
}

export default ViewBranch