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
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
        >
            <Box
                sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
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
        <Box
            sx={{
                width: "100%",
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Form Header */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <WorkOutlineOutlinedIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary">
                        {update ? 'Update Title' : 'Create New Title'}
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {update
                        ? 'Update the title details and organizational structure'
                        : 'Define a new organizational title and its reporting hierarchy'
                    }
                </Typography>
            </Box>

            {/* Scrollable form content */}
            <Box
                sx={{
                    overflow: 'auto',
                    flex: 1,
                    pr: 1,
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                    }
                }}
            >
                {/* Basic Information */}
                <FormSection title="Basic Information" icon={<InfoIcon fontSize="small" color="primary" />}>
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
                <FormSection title="Reporting Structure" icon={<SupervisorAccountIcon fontSize="small" color="primary" />}>
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
                <FormSection title="Role Assignment" icon={<SecurityIcon fontSize="small" color="primary" />}>
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
            </Box>

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
                            minWidth: '100px',
                            borderRadius: 1.5,
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        color="primary"
                        type="submit"
                        variant="contained"
                        sx={{
                            minWidth: '100px',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        {sendingRequest ? <CircularProgress size={24} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default TitleForm;