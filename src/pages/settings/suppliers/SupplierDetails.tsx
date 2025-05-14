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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { ISupplierDetails } from './interface';

const SupplierDetails = ({
    supplier,
    deleteSupplier,
    updateSupplier
}: ISupplierDetails) => {
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
                <LocalShippingOutlinedIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {supplier.name}
                </Typography>
            </Box>

            <Stack spacing={1.2} divider={<Divider flexItem />}>
                <Box display="flex" alignItems="center">
                    <LocationOnOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">{supplier.address}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <PhoneAndroidOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">{supplier.telephone}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <EmailOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body2">{supplier.email}</Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={2} mt={3} justifyContent="center">
                <Button
                    onClick={() => updateSupplier(supplier)}
                    variant="contained"
                    sx={{ textTransform: 'none', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: '#06685d' } }}
                    startIcon={<EditOutlinedIcon />}
                >
                    Update
                </Button>
                <Button
                    onClick={() => deleteSupplier(supplier)}
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

export default SupplierDetails