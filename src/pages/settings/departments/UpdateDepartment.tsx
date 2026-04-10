/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useMemo, useState } from 'react';
import { IDepartment, IDepartmentAxiosResponse, IUpdateDepartment } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { departmentSchema } from './schema';
import DepartmentUtills from './utills';
import { toast } from 'react-toastify';
import { Grid, Paper, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import DepartmentForm from './DepartmentForm';
import { updateDepartmentService } from './service';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const UpdateDepartment = ({
    sendingRequest,
    setSendingRequest,
    handleClose,
    department
}: IUpdateDepartment) => {
    const { updateDepartmentInStore } = DepartmentUtills();
    const theme = useTheme();
    const [defaultDepartment, setDefaultDepartment] = useState<any>(department);

    // Convert objects to IDs for form default values
    useEffect(() => {
        setDefaultDepartment({
            name: department.name || '',
            headOfDepartment: department.headOfDepartment?.id || null, // Convert to ID
            branch: department.branch?.id || null, // Convert to ID
            managersGroupEmail: department.managersGroupEmail || null,
        });
    }, [department]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IDepartment>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema) as any,
    });

    // Reset form when defaultDepartment changes
    useEffect(() => {
        reset({ ...defaultDepartment });
    }, [defaultDepartment, reset]);

    // Check if form has changes
    const hasChanges = useMemo(() => {
        return formState.isDirty;
    }, [formState.isDirty]);

    const onSubmit = async (formData: IDepartment) => {
        setSendingRequest(true);

        try {
            const updateData = {
                name: formData.name,
                headOfDepartment: formData.headOfDepartment,
                branch: formData.branch,
                managersGroupEmail: formData.managersGroupEmail,
            };

            const response = await updateDepartmentService(
                updateData,
                department?.id as string
            ) as IDepartmentAxiosResponse;

            if (response.status === 201) {
                const updatedDepartment = response.data as unknown as IDepartment;
                updateDepartmentInStore(updatedDepartment);

                toast.success('Department updated successfully');
                handleClose();
            } else {
                toast.error('Failed to update department');
            }
        } catch (error) {
            console.error('Error updating department:', error);
            toast.error('An error occurred while updating the department');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                borderRadius: 3,
                boxShadow: "none",
                maxWidth: "1200px",
                mx: "auto"
            }}
        >
            {/* Info Banner */}
            {hasChanges && (
                <Box
                    sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}
                >
                    <InfoOutlinedIcon color="info" fontSize="small" />
                    <Typography variant="body2" color="info.main">
                        You have unsaved changes. Click Update to save them.
                    </Typography>
                    <Chip
                        label="Modified"
                        size="small"
                        color="info"
                        sx={{ ml: 'auto', fontWeight: 500 }}
                    />
                </Box>
            )}

            <form
                style={{ width: "100%" }}
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <DepartmentForm
                            handleClose={handleClose}
                            buttonText="Update"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default UpdateDepartment;