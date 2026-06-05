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
    Button
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
import SupplierUtills from "../settings/suppliers/Utills";
import { useEffect, useMemo } from "react";
import StockItems from "../../components/stockForm/StockItems";
import AssetTypeUtills from "../settings/assetTypes/utills";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import { PageSection } from "../../components/layout";
import { brand, neutral, border } from "../../utils/tokens";

const PRIMARY_COLOR = brand[500];

const InventoryForm = ({
    register,
    control,
    formState,
    // handleClose,
    sendingRequest,
    buttonText
}: IInventoryForm) => {
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

    const renderFormFields = (
        fields: any[],
        title: string,
        subtitle: string,
        icon: React.ReactNode,
    ) => (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 3 },
                mb: 2.5,
                borderRadius: 2,
                border: `1px solid ${border.subtle}`,
                bgcolor: '#fff',
            }}
        >
            <PageSection title={title} subtitle={subtitle} icon={icon} mb={2.5}>
                <Grid container spacing={2.5}>
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
            </PageSection>
        </Paper>
    );

    return (
        <Box sx={{ maxWidth: '100%' }}>
            {renderFormFields(
                formSections.basicFields,
                "LPO Information",
                "Reference details for this purchase order and supplier",
                <BusinessIcon fontSize="small" />
            )}

            {formSections.otherFields.length > 0 && renderFormFields(
                formSections.otherFields,
                "Other Information",
                "Any additional details for this stock entry",
                <InventoryIcon fontSize="small" />
            )}

            {/* Stock items table */}
            <Box sx={{ mb: 2.5 }}>
                <StockItems />
            </Box>

            {/* Submit bar */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${border.subtle}`,
                    bgcolor: '#fff',
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[800] }}>
                            {sendingRequest ? 'Processing your request…' : 'Ready to submit?'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Please verify all information before submitting
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => navigate(ROUTES.INVENTORY)}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                minWidth: { xs: '100%', sm: 120 },
                                height: 40,
                                borderRadius: '8px',
                                borderColor: border.subtle,
                                color: neutral[600],
                                textTransform: 'none',
                                fontWeight: 500,
                                '&:hover': {
                                    borderColor: neutral[300],
                                    bgcolor: neutral[50],
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={sendingRequest}
                            startIcon={<SaveIcon />}
                            sx={{
                                minWidth: { xs: '100%', sm: 160 },
                                height: 40,
                                borderRadius: '8px',
                                bgcolor: PRIMARY_COLOR,
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.25)}`,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: '#065f54',
                                    boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                },
                                '&.Mui-disabled': {
                                    bgcolor: alpha(PRIMARY_COLOR, 0.45),
                                    color: '#fff',
                                },
                            }}
                        >
                            {sendingRequest ? 'Saving…' : buttonText}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default InventoryForm;
