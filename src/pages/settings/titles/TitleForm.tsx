/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Stack,
    Typography,
    alpha,
    useTheme,
    Paper,
    Button as MuiButton,
    CircularProgress
} from '@mui/material';
import {
    UseFormAutocompleteComponent,
    UseFormInput,
} from '../../../components/forms';
import TitleUtills from './utills';
import { ITitleForm } from './interface';
import RoleUtills from '../roles/utills';
import { useEffect } from 'react';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const TitleForm = ({
    register,
    control,
    formState,
    handleClose,
    buttonText,
    sendingRequest,
    update
}: ITitleForm) => {
    const { formFields } = TitleUtills();
    const { fetchAllRoles } = RoleUtills();
    const theme = useTheme();

    useEffect(() => {
        fetchAllRoles();
    }, []);

    // Section component for better organization
    const FormSection = ({
        title,
        icon,
        children
    }: {
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
    }) => (
        <Paper
            elevation={0}
            sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#08796C', 0.15)}`
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: alpha('#08796C', 0.04),
                    borderBottom: `1px solid ${alpha('#08796C', 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '7px',
                        background: 'linear-gradient(135deg, #08796C, #065E53)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': { color: '#fff', fontSize: '15px' }
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#08796C' }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {children}
                </Grid>
            </Box>
        </Paper>
    );

    // Group fields by type
    const basicFields = formFields.filter(field => field.value === 'name');
    const hierarchyFields = formFields.filter(field => field.value === 'reportsTo');
    const roleFields = formFields.filter(field => field.value === 'role');

    return (
        <Box sx={{ width: '100%' }}>
            {/* Form Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#08796C', 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <WorkOutlineOutlinedIcon sx={{ color: '#08796C' }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        {update ? 'Update Title' : 'Create New Title'}
                    </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {update
                        ? 'Update the title details and organizational structure'
                        : 'Define a new organizational title and its reporting hierarchy'
                    }
                </Typography>
            </Box>

            {/* Basic Information */}
            <FormSection title="Basic Information" icon={<InfoIcon fontSize="small" />}>
                {basicFields.map((field) => (
                    <Grid item xs={12} key={field.value}>
                        <UseFormInput
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                        />
                    </Grid>
                ))}
            </FormSection>

            {/* Hierarchy Structure */}
            <FormSection title="Reporting Structure" icon={<SupervisorAccountIcon fontSize="small" />}>
                {hierarchyFields.map((field) => (
                    <Grid item xs={12} key={field.value}>
                        <UseFormAutocompleteComponent
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                            options={field.options || []}
                        />
                    </Grid>
                ))}
            </FormSection>

            {/* Role Assignment */}
            <FormSection title="Role Assignment" icon={<SecurityIcon fontSize="small" />}>
                {roleFields.map((field) => (
                    <Grid item xs={12} key={field.value}>
                        <UseFormAutocompleteComponent
                            register={register}
                            control={control}
                            formState={formState}
                            value={field.value}
                            label={field.label}
                            options={field.options || []}
                        />
                    </Grid>
                ))}
            </FormSection>

            {/* Form Actions */}
            <Box
                sx={{
                    pt: 2,
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                >
                    <MuiButton
                        onClick={handleClose}
                        color="inherit"
                        type="button"
                        variant="outlined"
                        sx={{
                            minWidth: '110px',
                            borderRadius: '8px',
                            py: 0.85,
                            textTransform: 'none',
                            borderColor: alpha('#000', 0.2),
                            color: 'text.secondary',
                            '&:hover': { borderColor: alpha('#000', 0.3) },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        color="primary"
                        type="submit"
                        variant="contained"
                        sx={{
                            minWidth: '110px',
                            borderRadius: '8px',
                            py: 0.85,
                            textTransform: 'none',
                            bgcolor: '#08796C',
                            '&:hover': { bgcolor: '#065E53' },
                            boxShadow: '0 2px 8px rgba(8,121,108,0.3)',
                        }}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default TitleForm;