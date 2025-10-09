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
    Skeleton,
    CircularProgress,
    Button as MuiButton
} from "@mui/material";
import {
    UseFormAutocompleteComponent,
    UseFormInput,
    UseFormSelect,
} from "../../../components/forms";
import { IBranchForm } from "./interface";
import BranchUtills from "./utills";
import UserUtils from "../../users/utils";
import { useEffect, useState, useRef } from "react";
import RegionUtills from "../regions/utills";
import DistrictUtills from "../districts/utills";
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const BranchForm = ({
    register,
    control,
    formState,
    buttonText,
    sendingRequest,
    handleClose,
    update = false,
}: IBranchForm) => {
    const { formFields } = BranchUtills();
    const { fetchAllUsers, loading: usersLoading } = UserUtils();
    const { fetchAllRegions } = RegionUtills();
    const { fetchAllDistricts } = DistrictUtills();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const initialLoadCompleted = useRef(false);

    // Only fetch data once and prevent re-renders
    useEffect(() => {
        if (!initialLoadCompleted.current) {
            const loadAllData = async () => {
                setLoading(true);
                try {
                    await Promise.all([
                        fetchAllUsers(),
                        fetchAllRegions(),
                        fetchAllDistricts()
                    ]);
                    // Add small delay to ensure state updates are complete
                    setTimeout(() => setLoading(false), 300);
                } catch (error) {
                    console.error("Error loading form data:", error);
                    setLoading(false);
                }
            };

            loadAllData();
            initialLoadCompleted.current = true;
        }
    }, []);

    // Group fields by section
    const generalFields = formFields.filter(field =>
        ['name', 'email', 'telephone'].includes(field.value)
    );

    const locationFields = formFields.filter(field =>
        ['region', 'district'].includes(field.value)
    );

    const managementFields = formFields.filter(field =>
        ['branchManager', 'branchOperationsManager', 'creditAdministrator', 'relationshipManager'].includes(field.value)
    );

    // Section component for better organization
    const FormSection = ({
        title,
        icon,
        children,
        isLoading = false,
    }: {
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
        isLoading?: boolean;
    }) => (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
        >
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                        {title}
                    </Typography>
                </Stack>

                {isLoading && (
                    <CircularProgress size={16} thickness={4} sx={{ ml: 1 }} />
                )}
            </Box>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {isLoading ? (
                        // Skeleton placeholders while loading
                        <>
                            <Grid item xs={12} md={6}>
                                <Skeleton variant="rounded" height={48} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Skeleton variant="rounded" height={48} />
                            </Grid>
                        </>
                    ) : (
                        children
                    )}
                </Grid>
            </Box>
        </Paper>
    );

    // Render form fields with appropriate loading state
    const renderField = (field: any) => {
        const commonProps = {
            register,
            control,
            formState,
            value: field.value,
            label: field.label,
        };

        if (field.type === "input") {
            return <UseFormInput {...commonProps} />;
        } else if (field.type === "textarea") {
            return <UseFormInput {...commonProps} multiline row={3} />;
        } else if (field.type === "select") {
            return <UseFormSelect {...commonProps} options={field.options || []} />;
        } else if (field.type === "autocomplete") {
            // Only render autocomplete when we have options
            if (loading) {
                return <Skeleton variant="rounded" height={48} />;
            }
            return <UseFormAutocompleteComponent {...commonProps} options={field.options || []} />;
        }
        return null;
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxHeight: '80vh', // Ensure it doesn't exceed 90vh
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Form Header */}
            <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <AccountBalanceOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary">
                        {update ? 'Update Branch' : 'Create New Branch'}
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    {update
                        ? 'Update branch details and management team assignments'
                        : 'Enter details to create a new branch office'
                    }
                </Typography>
            </Box>

            {/* Scrollable form content */}
            <Box
                sx={{
                    overflow: 'auto',
                    flex: 1,
                    pr: 1, // Add space for scrollbar
                    // Custom scrollbar styling
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
                {/* General Information - 3 fields in 2 rows */}
                <FormSection
                    title="General Information"
                    icon={<EmailIcon fontSize="small" color="primary" />}
                >
                    <Grid item xs={12} md={6}>
                        {renderField(generalFields.find(f => f.value === 'name'))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderField(generalFields.find(f => f.value === 'email'))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderField(generalFields.find(f => f.value === 'telephone'))}
                    </Grid>
                </FormSection>

                {/* Location Information - horizontal layout */}
                <FormSection
                    title="Location"
                    icon={<LocationOnIcon fontSize="small" color="primary" />}
                >
                    {locationFields.map((field) => (
                        <Grid item xs={12} md={6} key={field.value}>
                            {renderField(field)}
                        </Grid>
                    ))}
                </FormSection>

                {/* Management Team - with loading handling */}
                <FormSection
                    title="Management Team"
                    icon={<SupervisorAccountIcon fontSize="small" color="primary" />}
                    isLoading={loading}
                >
                    {!loading && managementFields.map((field, index) => (
                        <Grid item xs={12} md={6} key={field.value}>
                            {renderField(field)}
                        </Grid>
                    ))}
                </FormSection>
            </Box>

            {/* Form Actions - fixed at bottom */}
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
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                        disabled={loading}
                    >{sendingRequest ? <CircularProgress size={24} color="inherit" /> : buttonText}</MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default BranchForm;