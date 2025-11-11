/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography, Box, alpha, useTheme, Alert, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ButtonComponent from '../../../components/forms/Button';
import { toast } from 'react-toastify';
import { IDeleteDepartment } from './interface';
import { deleteDepartmentService } from './service';
import DepartmentUtills from './utills';

const DeleteDepartment = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    buttonText,
    department
}: IDeleteDepartment) => {
    const { removeDepartmentFromStore } = DepartmentUtills();
    const theme = useTheme();

    const deleteDepartment = async () => {
        setSendingRequest(true);
        const response = await deleteDepartmentService(department?.id as string);
        setSendingRequest(false);
        if (response?.status === "success") {
            removeDepartmentFromStore(department);
            handleClose();
            toast.success(response?.data?.message);
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
                        mb: 2
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
                    This action cannot be undone. The department and all associated data will be permanently removed.
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
                        Deleting this department may affect organizational structure and employee assignments.
                    </Typography>
                </Alert>

                {/* Department details */}
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                        mb: 3
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <AccountTreeOutlinedIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {department.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {department.id}
                            </Typography>
                        </Box>
                    </Stack>

                    {department.headOfDepartment && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Head of Department:</strong> {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                        </Typography>
                    )}

                    {department.branch && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Branch:</strong> {department.branch.name || 'Head Office'}
                        </Typography>
                    )}

                    {department.managersGroupEmail && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <strong>Managers Group:</strong> {department.managersGroupEmail}
                        </Typography>
                    )}
                </Box>
            </Grid>

            {/* Action buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                    variant="body2"
                    color="error"
                    fontWeight={500}
                    sx={{ alignSelf: 'center' }}
                >
                    Are you sure you want to delete this department?
                </Typography>

                <Stack direction="row" spacing={2}>
                    <ButtonComponent
                        handleClick={handleClose}
                        buttonColor="inherit"
                        type="button"
                        variant="outlined"
                        sendingRequest={false}
                        buttonText="Cancel"
                    />
                    <ButtonComponent
                        buttonColor="error"
                        type="button"
                        handleClick={deleteDepartment}
                        sendingRequest={sendingRequest}
                        buttonText={buttonText}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default DeleteDepartment;