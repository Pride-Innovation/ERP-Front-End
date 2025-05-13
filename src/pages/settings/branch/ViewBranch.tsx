import {
    Box,
    Button,
    Card,
    Stack,
    Typography,
    Divider,
    useTheme
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';

import { IBranchDetails } from './interface';

const ViewBranch = ({ branch, deleteBranch, updateBranch }: IBranchDetails) => {
    const theme = useTheme()
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
                <CameraOutdoorOutlinedIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {branch.name}
                </Typography>
            </Box>

            <Stack spacing={1.2} divider={<Divider flexItem />}>
                <Box display="flex" alignItems="center">
                    <EmailOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">{branch.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <PhoneAndroidOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">{branch.telephone}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <LocationOnOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">
                        {branch.district?.name}, {branch.region?.name}
                    </Typography>
                </Box>
            </Stack>

            <Box mt={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
                    Management
                </Typography>
                <Stack spacing={1.2}>
                    {[
                        { label: 'Manager', person: branch.branchManager },
                        { label: 'BOM', person: branch.branchOperationsManager },
                        { label: 'Credit Admin', person: branch.creditAdministrator },
                        { label: 'Relationship Mgr', person: branch.relationshipManager }
                    ].map(({ label, person }, index) =>
                        person?.firstName ? (
                            <Box key={index} display="flex" alignItems="center">
                                <SupervisorAccountOutlinedIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.secondary.main }} />
                                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                                    <strong>{label}:</strong> {person.firstName} {person.lastName}
                                </Typography>
                            </Box>
                        ) : null
                    )}
                </Stack>
            </Box>

            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
                <Button
                    onClick={() => updateBranch(branch)}
                    variant="contained"
                    sx={{ textTransform: 'none', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: '#06685d' } }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteBranch(branch)}
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
};

export default ViewBranch;
