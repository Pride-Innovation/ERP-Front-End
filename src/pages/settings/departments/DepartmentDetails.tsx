import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { IDepartmentDetails } from "./interface";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IUser } from "../../users/interface";
import ApartmentIcon from '@mui/icons-material/Apartment';

const DepartmentDetails = ({
    deleteDepartment,
    department,
    updateDepartment
}: IDepartmentDetails) => {
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
                    <ApartmentIcon fontSize="small" color="info" sx={{ mr: "4px", fontSize: "16px" }} />
                    {department.name}
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
                    Head of Department
                    <br />
                    <b> {(department.head as IUser)?.name}</b>
                </Typography>
                <Button
                    onClick={() => updateDepartment(department)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                <Button
                    onClick={() => deleteDepartment(department)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
            </Stack>
        </Card >
    )
}

export default DepartmentDetails