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
    Paper,
    alpha,
    useTheme,
    Card
} from "@mui/material";
import InventoryUtills from "./Utills";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect,
    UseFormTimePicker
} from "../../components/forms";
import { IInventoryForm } from "./interface";
import ButtonComponent from "../../components/forms/Button";
import SupplierUtills from "../settings/suppliers/Utills";
import { useEffect, useMemo } from "react";
import StockItems from "../../components/stockForm/StockItems";
import AssetTypeUtills from "../settings/assetTypes/utills";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const InventoryForm = ({
    register,
    control,
    formState,
    // handleClose,
    sendingRequest,
    buttonText
}: IInventoryForm) => {
    const theme = useTheme();
    const { formFields } = InventoryUtills();
    const { fetchAllSuppliers } = SupplierUtills();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const navigate = useNavigate();

    useEffect(() => { fetchAllSuppliers() }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);

    const formSections = useMemo(() => {
        const basicFields = formFields.filter(field =>
            ["lpoNumber", "lpoReferenceCode", "supplier", "poNumber", "name"].includes(field.value)
        );

        const dateFields = formFields.filter(field =>
            ["dateOrdered", "dateDelivered", "dateInvoice"].includes(field.value)
        );

        const detailFields = formFields.filter(field =>
            ["description", "notes", "remarks"].includes(field.value)
        );

        const otherFields = formFields.filter(field =>
            ![...basicFields, ...dateFields, ...detailFields].includes(field)
        );

        return {
            basicFields,
            dateFields,
            detailFields,
            otherFields
        };
    }, [formFields]);

    const renderFormFields = (fields: any[], title: string, icon: React.ReactNode) => (
        <Card
            elevation={0}
            sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha('#000', 0.08)}`,
                bgcolor: 'white'
            }}
        >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1
                    }}
                >
                    {icon}
                </Box>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    {title}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {fields.map((field, idx) => {
                    const commonProps = {
                        register,
                        control,
                        formState,
                        value: field.value,
                        label: field.label,
                        required: field.required === false ? field.required : true
                    };

                    // Adjust grid size based on field type or importance
                    const gridSize = field.type === "textarea" ? 12 :
                        ["lpoNumber", "name", "supplier"].includes(field.value) ? 6 : 4;

                    return (
                        <Grid item xs={12} sm={6} md={gridSize} key={`${field.value}-${idx}`}>
                            {field.type === "input" || field.type === "number" ? (
                                <UseFormInput {...commonProps} type={field.type === "number" ? "number" : "text"} />
                            ) : field.type === "textarea" ? (
                                <UseFormInput
                                    {...commonProps}
                                    multiline
                                    row={5}
                                // helperText={field.helperText || "Provide any additional information needed"} 
                                />
                            ) : field.type === "select" ? (
                                <UseFormSelect {...commonProps} options={field.options} />
                            ) : field.type === "date" ? (
                                <UseFormDatePicker {...commonProps} />
                            ) : field.type === "time" ? (
                                <UseFormTimePicker {...commonProps} />
                            ) : field.type === "autocomplete" ? (
                                <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                            ) : null}
                        </Grid>
                    );
                })}
            </Grid>
        </Card>
    );

    return (
        <Box sx={{
            maxWidth: '100%',
            backgroundColor: alpha('#f5f5f5', 0.5),
            borderRadius: 2,
            p: { xs: 0, sm: 2 }
        }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {renderFormFields(
                        formSections.basicFields,
                        "LPO Information",
                        <BusinessIcon fontSize="small" />
                    )}

                    {formSections.otherFields.length > 0 && renderFormFields(
                        formSections.otherFields,
                        "Other Information",
                        <InventoryIcon fontSize="small" />
                    )}

                    <Box
                        sx={{
                            width: "100%",
                            mt: 3,
                            mb: 3,
                            position: 'relative'
                        }}
                    >
                        <StockItems />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: `1px solid ${alpha('#000', 0.08)}`,
                            bgcolor: 'white'
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", sm: "center" }}
                        >
                            <Box>
                                <Typography variant="body1" fontWeight={500} color="text.primary">
                                    {sendingRequest ? 'Processing your request...' : 'Ready to submit?'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Please verify all information before submitting
                                </Typography>
                            </Box>

                            <Stack
                                direction="row"
                                spacing={2}
                                sx={{
                                    '& button': {
                                        px: 3,
                                        py: 1.2,
                                        borderRadius: 1.5,
                                    }
                                }}
                            >
                                <ButtonComponent
                                    handleClick={() => navigate(ROUTES.INVENTORY)}
                                    buttonColor="inherit"
                                    type="button"
                                    sendingRequest={false}
                                    buttonText="Cancel"
                                    variant="outlined"
                                />
                                <ButtonComponent
                                    buttonColor="success"
                                    type="submit"
                                    sendingRequest={sendingRequest}
                                    buttonText={buttonText}
                                    variant="contained"
                                />
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InventoryForm;