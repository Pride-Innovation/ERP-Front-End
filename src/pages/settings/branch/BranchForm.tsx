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
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import RegionUtills from "../regions/utills";
import DistrictUtills from "../districts/utills";
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// Move FormSection outside the main component to prevent recreation on each render
const FormSection = memo(({
    title,
    icon,
    children,
    isLoading = false,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isLoading?: boolean;
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2.5,
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
            <Box sx={{ p: 2.5 }}>
                {isLoading ? (
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rounded" height={48} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rounded" height={48} />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={2.5}>
                        {children}
                    </Grid>
                )}
            </Box>
        </Paper>
    );
});

// Ensure the component has a display name for better debugging
FormSection.displayName = 'FormSection';

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
    const { fetchAllUsers } = UserUtils();
    const { fetchAllRegions } = RegionUtills();
    const { fetchAllDistricts } = DistrictUtills();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const initialLoadCompleted = useRef(false);

    // Memoize the loadAllData function to prevent recreation on each render
    const loadAllData = useCallback(async () => {
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
    }, [fetchAllUsers, fetchAllRegions, fetchAllDistricts]);

    // Only fetch data once and prevent re-renders
    useEffect(() => {
        if (!initialLoadCompleted.current) {
            loadAllData();
            initialLoadCompleted.current = true;
        }
    }, [loadAllData]);

    // Memoize field collections to prevent recreation on each render
    const generalFields = useMemo(() =>
        formFields.filter(field => ['name', 'email', 'telephone'].includes(field.value))
        , [formFields]);

    const locationFields = useMemo(() =>
        formFields.filter(field => ['region', 'district'].includes(field.value))
        , [formFields]);

    const managementFields = useMemo(() =>
        formFields.filter(field =>
            ['branchManager', 'branchOperationsManager', 'creditAdministrator', 'relationshipManager'].includes(field.value)
        ).map(field => ({
            ...field,
            // Ensure options reference is stable
            options: field.options || []
        }))
        , [formFields]);

    // Memoize renderField function to prevent recreation on each render
    const renderField = useCallback((field: any) => {
        if (!field) return null;

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
    }, [register, control, formState, loading]);

    // Memoize form content to prevent unnecessary re-renders
    const formContent = useMemo(() => (
        <>
            {/* General Information */}
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

            {/* Location Information */}
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

            {/* Management Team */}
            <FormSection
                title="Management Team"
                icon={<SupervisorAccountIcon fontSize="small" color="primary" />}
                isLoading={loading}
            >
                {!loading && managementFields.map((field) => (
                    <Grid item xs={12} md={6} key={`${field.value}-stable`}>
                        {renderField(field)}
                    </Grid>
                ))}
            </FormSection>
        </>
    ), [loading, generalFields, locationFields, managementFields, renderField]);

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
            <Box sx={{ mb: 2.5 }}>
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
                {formContent}
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
                            py: 0.75
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
                            py: 0.75,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                        disabled={loading}
                    >
                        {sendingRequest ? <CircularProgress size={24} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default BranchForm;