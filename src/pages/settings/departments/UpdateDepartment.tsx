/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect } from 'react';
import { IDepartmentAxiosResponse, IDepartmentFormValues, IUpdateDepartment } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { departmentSchema } from './schema';
import DepartmentUtills from './utills';
import { toast } from 'react-toastify';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
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

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IDepartmentFormValues>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema),
        defaultValues: {
            name: department.name || '',
            headOfDepartment: (department.headOfDepartment?.id as number) || undefined,
            branch: (department.branch?.id as number) || undefined,
            managersGroupEmail: department.managersGroupEmail || null,
        },
    });

    useEffect(() => {
        if (department) {
            reset({
                name: department.name || '',
                headOfDepartment: (department.headOfDepartment?.id as number) || undefined,
                branch: (department.branch?.id as number) || undefined,
                managersGroupEmail: department.managersGroupEmail || null,
            });
        }
    }, [department, reset]);

    const onSubmit = async (formData: IDepartmentFormValues) => {
        setSendingRequest(true);
        try {
            const response = await updateDepartmentService(
                {
                    name: formData.name,
                    headOfDepartment: formData.headOfDepartment,
                    branch: formData.branch,
                    managersGroupEmail: formData.managersGroupEmail || null,
                },
                department?.id as string
            ) as IDepartmentAxiosResponse;

            if (response.status === 200) {
                updateDepartmentInStore(response.data);
                toast.success('Department updated successfully', { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const properties = error?.response?.data?.properties;
            const message = error?.response?.data?.message;
            if (properties) {
                const messages = Object.values(properties).join(', ');
                toast.error(messages, { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error('Failed to update department. Please try again.', { position: 'bottom-right' });
            }
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Info Banner */}
            {formState.isDirty && (
                <Box
                    sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        borderRadius: '8px',
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
                <DepartmentForm
                    handleClose={handleClose}
                    buttonText="Update"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                />
            </form>
        </Box>
    );
};

export default UpdateDepartment;