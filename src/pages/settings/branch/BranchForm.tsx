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

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2.5,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#08796C', 0.15)}`
            }}
        >
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: alpha('#08796C', 0.04),
                    borderBottom: `1px solid ${alpha('#08796C', 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '7px',
                            background: 'linear-gradient(135deg, #08796C, #065E53)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            '& .MuiSvgIcon-root': { color: '#fff', fontSize: '15px' },
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#08796C' }}>
                        {title}
                    </Typography>
                </Stack>

                {isLoading && (
                    <CircularProgress size={14} thickness={4} sx={{ ml: 1, color: '#08796C' }} />
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
        <Box sx={{ width: "100%" }}>
            {/* Form Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#08796C', 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
                    <AccountBalanceOutlinedIcon fontSize="small" sx={{ color: '#08796C' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
                        {update ? 'Update Branch' : 'Create New Branch'}
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {update
                        ? 'Update branch details and management team assignments'
                        : 'Enter details to create a new branch office'
                    }
                </Typography>
            </Box>

            {formContent}

            {/* Form Actions */}
            <Box
                sx={{
                    pt: 2.5,
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${alpha('#08796C', 0.12)}`,
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
                            bgcolor: '#08796C',
                            boxShadow: '0 2px 8px rgba(8,121,108,0.3)',
                            '&:hover': { bgcolor: '#065E53' },
                        }}
                        disabled={loading}
                    >
                        {sendingRequest ? <CircularProgress size={20} color="inherit" /> : buttonText}
                    </MuiButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default BranchForm;