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
    UseFormInput
} from '../../../components/forms';
import DepartmentUtills from './utills';
import { IDepartmentForm } from './interface';
import UserUtils from '../../users/utils';
import { useEffect, useMemo, useCallback } from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import InfoIcon from '@mui/icons-material/Info';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BranchUtills from '../branch/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const DepartmentForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText
}: IDepartmentForm & { update?: boolean }) => {
    const { formFields } = DepartmentUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllUsers } = UserUtils();
    const theme = useTheme();

    // Get data from Redux to check if already loaded
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);

    // Only fetch once when component mounts and data is not available
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) {
                if (!users || users.length === 0) {
                    await fetchAllUsers();
                }
                if (!branches || branches.length === 0) {
                    await fetchAllBranches();
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - only run once

    // Memoize FormSection to prevent recreation
    const FormSection = useCallback(({
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
    ), [theme]);

    // Memoize field groups - only recalculate when formFields change
    const basicFields = useMemo(
        () => formFields.filter(field => ['name'].includes(field.value)),
        [formFields]
    );

    const managementFields = useMemo(
        () => formFields.filter(field =>
            ['headOfDepartment', 'branch', 'managersGroupEmail'].includes(field.value)
        ),
        [formFields]
    );

    // Memoize renderField to prevent recreation on every render
    const renderField = useCallback((field: any) => {
        const commonProps = {
            register,
            control,
            formState,
            value: field.value,
            label: field.label,
        };

        switch (field.type) {
            case "input":
                return <UseFormInput key={field.value} {...commonProps} />;
            case "email":
                return <UseFormInput key={field.value} {...commonProps} type="email" />;
            case "autocomplete":
                return (
                    <UseFormAutocompleteComponent
                        key={field.value}
                        {...commonProps}
                        options={field.options || []}
                    />
                );
            default:
                return <UseFormInput key={field.value} {...commonProps} />;
        }
    }, [register, control, formState]); // Only recreate when these change

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
                    <AccountTreeOutlinedIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary">
                        {buttonText === 'Submit' ? 'Create New Department' : 'Update Department'}
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {buttonText === 'Submit'
                        ? 'Add a new department to your organizational structure'
                        : 'Update department details and management assignments'
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
                            {renderField(field)}
                        </Grid>
                    ))}
                </FormSection>

                {/* Management & Location */}
                <FormSection title="Management & Location" icon={<SupervisorAccountIcon fontSize="small" color="primary" />}>
                    {managementFields.map((field) => {
                        const gridSize = field.value === 'managersGroupEmail' ? 12 : 6;
                        return (
                            <Grid item xs={12} md={gridSize} key={field.value}>
                                {renderField(field)}
                            </Grid>
                        );
                    })}
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
                        disabled={sendingRequest}
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
                        disabled={sendingRequest}
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

export default DepartmentForm;