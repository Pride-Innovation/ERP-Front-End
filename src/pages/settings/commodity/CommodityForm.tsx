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
    UseFormSelect
} from '../../../components/forms';
import { ICommodityForm } from './interface';
import CommodityUtills from './utills';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';

const CommodityForm = ({
    register,
    control,
    formState,
    buttonText,
    sendingRequest,
    handleClose,
    update = false,
}: ICommodityForm) => {
    const { formFields } = CommodityUtills();
    const theme = useTheme();

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
    const basicFields = formFields.filter(field => ['name'].includes(field.value));
    const measurementFields = formFields.filter(field => ['groupName'].includes(field.value));
    const classificationFields = formFields.filter(field => ['assetType'].includes(field.value));

    // Render field with proper component type
    const renderField = (field: any) => {
        const commonProps = {
            register,
            control,
            formState,
            value: field.value,
            label: field.label,
        };

        switch (field.type) {
            case "input":
                return <UseFormInput {...commonProps} />;
            case "textarea":
                return <UseFormInput {...commonProps} multiline row={4} />;
            case "number":
                return <UseFormInput {...commonProps} type="number" />;
            case "select":
                return <UseFormSelect {...commonProps} options={field.options || []} />;
            case "autocomplete":
                return <UseFormAutocompleteComponent {...commonProps} options={field.options || []} />;
            default:
                return <UseFormInput {...commonProps} />;
        }
    };

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
                    <CategoryOutlinedIcon color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary">
                        {update ? 'Update Commodity' : 'Create New Commodity'}
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {update
                        ? 'Update commodity details and asset classification'
                        : 'Define a new commodity type with measurement units and asset classification'
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

                {/* Measurement Details */}
                <FormSection title="Measurement" icon={<LayersIcon fontSize="small" color="primary" />}>
                    {measurementFields.map((field) => (
                        <Grid item xs={12} key={field.value}>
                            {renderField(field)}
                        </Grid>
                    ))}
                </FormSection>

                {/* Asset Classification */}
                <FormSection title="Asset Classification" icon={<AssignmentIcon fontSize="small" color="primary" />}>
                    {classificationFields.map((field) => (
                        <Grid item xs={12} key={field.value}>
                            {renderField(field)}
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

export default CommodityForm;