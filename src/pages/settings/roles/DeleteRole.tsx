/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Divider, Alert } from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IDeleteRole, IRoleAxiosResponse } from '../interface';
import ButtonComponent from '../../../components/forms/Button';
import { deleteRoleService } from './service';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { removeRoles } from './slice';

const DeleteRole = ({
    role,
    handleClose,
    sendingRequest,
    buttonText
}: IDeleteRole) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const deleteRole = async () => {
        try {
            const response = await deleteRoleService(role?.id as number) as IRoleAxiosResponse;
            if (response.status === 204) {
                toast.success("Role has been deleted successfully", { position: 'bottom-right' });
                dispatch(removeRoles(role));
                handleClose();
            }
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error("Failed to delete role. Please try again.", { position: 'bottom-right' });
        }
    };

    return (
        <Grid item container spacing={3} xs={12} sx={{ mt: 0 }}>
            {/* Header */}
            <Grid item xs={12}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.error.main, 0.1)
                        }}
                    >
                        <WarningAmberIcon color="error" />
                    </Box>
                    <Typography variant="h6" fontWeight={500} color="error">
                        Confirm Deletion
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    This action cannot be undone. All permissions associated with this role will be removed.
                </Typography>
                <Divider sx={{ my: 2, opacity: 0.6 }} />
            </Grid>

            {/* Warning alert */}
            <Grid item xs={12}>
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{
                        mb: 3,
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        }
                    }}
                >
                    <Typography variant="body2">
                        Users with this role may lose access to certain features after deletion.
                    </Typography>
                </Alert>

                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 3
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <ShieldOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {role.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {(role.permissions as any[])?.length || 0} permissions • ID: {role.id}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Grid>

            {/* Action buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    Are you sure you want to delete this role?
                </Typography>

                <Stack direction="row" spacing={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor='inherit'
                        type='button'
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    />
                    <ButtonComponent
                        buttonColor='error'
                        type='button'
                        handleClick={deleteRole}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    )
}

export default DeleteRole;