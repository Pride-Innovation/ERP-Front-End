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
    Divider,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IDepartmentDetails } from './interface';

const DepartmentDetails = ({
    deleteDepartment,
    department,
    updateDepartment
}: IDepartmentDetails) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                boxShadow: 3,
                borderRadius: 2,
                p: 3,
                bgcolor: 'white',
                color: 'black',
                border: `1px solid ${theme.palette.primary.main}`,
                minWidth: 300,
                maxWidth: 400,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <AccountTreeOutlinedIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {department.name}
                </Typography>
            </Box>

            <Stack spacing={1.2} divider={<Divider flexItem />}>
                {department.headOfDepartment && (
                    <Box display="flex" alignItems="center">
                        <SupervisorAccountOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                        <Typography variant="body2">
                            <strong>Head:</strong> {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                        </Typography>
                    </Box>
                )}

                <Box display="flex" alignItems="center">
                    <LocationOnOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">
                        <strong>Branch:</strong> Head Office
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
                <Button
                    onClick={() => updateDepartment(department)}
                    variant="contained"
                    sx={{ textTransform: 'none', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: '#06685d' } }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteDepartment(department)}
                    variant="outlined"
                    color="error"
                    sx={{ textTransform: 'none' }}
                    startIcon={<DeleteOutlineOutlinedIcon />}
                >
                    Delete
                </Button>
            </Stack>
        </Card>
    );
}

export default DepartmentDetails