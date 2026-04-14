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
} from "@mui/material";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms";
import SupplierUtills from "./Utills";
import { ISupplierForm } from "./interface";
import { useEffect } from "react";
import CommodityUtills from "../commodity/utills";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const SupplierForm = ({
    register,
    control,
    formState,
    handleClose,
    sendingRequest,
    buttonText,
    update = false
}: ISupplierForm & { update?: boolean }) => {
    const { formFields } = SupplierUtills();
    const { fetchAllCommodities } = CommodityUtills();
    const theme = useTheme();

    useEffect(() => {
        fetchAllCommodities();
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
    const basicFields = formFields.filter(field => ['name'].includes(field.value));
    const contactFields = formFields.filter(field => ['email', 'telephone', 'address'].includes(field.value));
    const commodityFields = formFields.filter(field => ['commodity'].includes(field.value));

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
            case "date":
                return <UseFormDatePicker {...commonProps} />;
            case "autocomplete":
                return <UseFormAutocompleteComponent {...commonProps} options={field.options || []} />;
            default:
                return <UseFormInput {...commonProps} />;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Form Header */}
            <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#08796C', 0.1)}` }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <LocalShippingOutlinedIcon sx={{ color: '#08796C' }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B' }}>
                        {update ? 'Update Supplier' : 'Create New Supplier'}
                    </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {update
                        ? 'Update supplier details and commodity associations'
                        : 'Add a new supplier to your supply chain management system'
                    }
                </Typography>
            </Box>

                {/* Basic Information */}
                <FormSection title="Basic Information" icon={<InfoIcon fontSize="small" />}>
                    {basicFields.map((field) => (
                        <Grid item xs={12} key={field.value}>
                            {renderField(field)}
                        </Grid>
                    ))}
                </FormSection>

                {/* Contact Information */}
                <FormSection title="Contact Information" icon={<ContactsIcon fontSize="small" />}>
                    {contactFields.map((field) => {
                        const gridSize = field.type === "textarea" ? 12 : 6;
                        return (
                            <Grid item xs={12} md={gridSize} key={field.value}>
                                {renderField(field)}
                            </Grid>
                        );
                    })}
                </FormSection>

                {/* Commodity Association */}
                <FormSection title="Commodity Association" icon={<Inventory2Icon fontSize="small" />}>
                    {commodityFields.map((field) => (
                        <Grid item xs={12} key={field.value}>
                            {renderField(field)}
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

export default SupplierForm;