import { Box, Button, Card, Grid, IconButton, Stack, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IRoleDetails } from "../interface";
import RoleUtills from "./utills";
import RoleRow from "./RoleRow";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

const RoleDetails = ({ role, deleteRole, updateRole }: IRoleDetails) => {
    const { modulesList } = RoleUtills()
    return (
        <Grid container xs={12} >
            <Box
                display="grid"
                sx={{ width: "100%" }}
                gridTemplateColumns="1fr 3fr"
                gap={4}
            >
                <Card sx={{
                    boxShadow: 0,
                    border: `2px solid ${grey[200]}`,
                }}>
                    <Box
                        sx={{ width: "100%", alignItems: "center" }}
                        px={3}
                        py={1.5}
                    >
                        <Typography noWrap variant="body2">
                            Manage Role
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
                        <AccountCircleOutlinedIcon fontSize="large" color="info" sx={{ fontSize: "50px" }} />
                        <Typography noWrap variant="body1" sx={{ fontWeight: 600, textAlign: "center" }}>
                            {role.name}
                        </Typography>
                        <Button
                            onClick={() => updateRole(role)}
                            sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                        <Button
                            onClick={() => deleteRole(role)}
                            sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>

                    </Stack>

                </Card >
                <Card sx={{
                    boxShadow: 0,
                    border: `2px solid ${grey[200]}`,
                }}>
                    <Box
                        display="grid"
                        sx={{ width: "100%", alignItems: "center" }}
                        gridTemplateColumns="6fr 1fr 1fr 1fr 1fr "
                        gap={4}
                        px={3}
                        py={1.5}
                    >
                        <Typography variant="body1">Action</Typography>
                        <Typography variant='body2'>Create</Typography>
                        <Typography variant='body2'>Read</Typography>
                        <Typography variant='body2'>Update</Typography>
                        <Typography variant='body2'>Delete</Typography>
                    </Box>
                    <Box sx={{
                        borderTop: `2px solid ${grey[200]}`,
                        borderBottom: `2px solid ${grey[100]}`,
                        px: 1.5,
                        py: 0.5,
                        bgcolor: grey[50],
                        display: "flex",
                        alignItems: "center"
                    }} >
                        <IconButton>
                            <SettingsSuggestIcon fontSize="medium" color="info" />
                        </IconButton>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {role.name} Permissions
                        </Typography>
                    </Box>
                    {
                        modulesList.map(module => (<RoleRow role={role} module={module} />))
                    }
                </Card >
            </Box>
        </Grid>
    )
}

export default RoleDetails