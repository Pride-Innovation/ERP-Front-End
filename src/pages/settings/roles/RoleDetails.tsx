/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import { grey } from "@mui/material/colors";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

import { IRoleDetails } from "../interface";
import RoleUtills from "./utills";
import RoleRow from "./RoleRow";

const RoleDetails = ({ role, deleteRole, updateRole }: IRoleDetails) => {
    const { modulesList } = RoleUtills();
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card
                    sx={{
                        boxShadow: 3,
                        borderRadius: 2,
                        p: 3,
                        border: `1px solid ${theme.palette.primary.light}`,
                        bgcolor: "white"
                    }}
                >
                    <Typography variant="subtitle2" color={theme.palette.primary.main} mb={2}>
                        Manage Role
                    </Typography>
                    <Stack spacing={2} alignItems="center">
                        <AccountCircleOutlinedIcon fontSize="large" sx={{ fontSize: 60, color: theme.palette.info.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center" }}>
                            {role.name}
                        </Typography>
                        <Button
                            onClick={() => updateRole(role)}
                            variant="contained"
                            color="primary"
                            startIcon={<EditOutlinedIcon />}
                            sx={{ textTransform: "none", width: '100%' }}
                        >
                            Update
                        </Button>
                        <Button
                            onClick={() => deleteRole(role)}
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineOutlinedIcon />}
                            sx={{ textTransform: "none", width: '100%' }}
                        >
                            Delete
                        </Button>
                    </Stack>
                </Card>
            </Grid>

            <Grid item xs={12} md={8}>
                <Card
                    sx={{
                        boxShadow: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.primary.light}`,
                        bgcolor: "white"
                    }}
                >
                    <Box
                        px={3}
                        py={2}
                        display="grid"
                        gridTemplateColumns="6fr 1fr 1fr 1fr 1fr"
                        alignItems="center"
                        bgcolor={grey[100]}
                        borderBottom={`1px solid ${grey[300]}`}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            Action
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Create</Typography>
                        <Typography variant="body2" color="text.secondary">Read</Typography>
                        <Typography variant="body2" color="text.secondary">Update</Typography>
                        <Typography variant="body2" color="text.secondary">Delete</Typography>
                    </Box>

                    <Box
                        px={2.5}
                        py={1}
                        display="flex"
                        alignItems="center"
                        bgcolor={grey[50]}
                        borderBottom={`1px solid ${grey[200]}`}
                    >
                        <IconButton disabled>
                            <SettingsSuggestIcon fontSize="medium" color="info" />
                        </IconButton>
                        <Typography variant="subtitle2" color={theme.palette.secondary.main} sx={{ fontWeight: 600 }}>
                            {role.name} Permissions
                        </Typography>
                    </Box>

                    <Box px={2.5} py={1.5}>
                        {modulesList.map((module, index) => (
                            <RoleRow key={index} role={role} module={module} />
                        ))}
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

export default RoleDetails;
