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
import { useContext, useEffect, useMemo } from "react";
import { AutocompleteContext } from "../../context/autocomplete";
import StockItems from "../../components/stockForm/StockItems";
import AssetTypeUtills from "../settings/assetTypes/utills";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
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
    buttonText,
    section,
    hideSubmitBar
}: IInventoryForm) => {
    const showDetails = section === undefined || section === 'details';
    const showItems = section === undefined || section === 'items';
    const { formFields } = InventoryUtills();
    const { fetchAllSuppliers } = SupplierUtills();
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const navigate = useNavigate();

    // The reusable Autocomplete pushes its (debounced) typed text into this shared context.
    const { inputValue, label } = useContext(AutocompleteContext);

    // Load the first page of suppliers up front.
    useEffect(() => { fetchAllSuppliers({ pageSize: 10 }) }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);

    // Supplier list is paginated (first 10). When the user types in the Supplier field,
    // re-query by name so a supplier outside the first page is still reachable. Guarded on the
    // field label so it never fires for other autocompletes sharing the context.
    useEffect(() => {
        if (label === 'supplier') {
            fetchAllSuppliers({ name: inputValue || undefined, pageSize: 10 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    const formSections = useMemo(() => {
        const basicFields = formFields.filter(field =>
            ["lpoNumber", "lpoReferenceCode", "supplier", "poNumber", "name"].includes(field.value)
        );

        const dateFields = formFields.filter(field =>
            ["orderDate", "deliveryDate", "invoiceDate"].includes(field.value)
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
            {showDetails && renderFormFields(
                formSections.basicFields,
                "LPO Information",
                "Reference details for this purchase order and supplier",
                <BusinessIcon fontSize="small" />
            )}

            {showDetails && formSections.dateFields.length > 0 && renderFormFields(
                formSections.dateFields,
                "Order & Delivery Dates",
                "When the order was placed, delivered and invoiced — the delivery date drives asset depreciation",
                <CalendarMonthIcon fontSize="small" />
            )}

            {showDetails && formSections.otherFields.length > 0 && renderFormFields(
                formSections.otherFields,
                "Other Information",
                "Any additional details for this stock entry",
                <InventoryIcon fontSize="small" />
            )}

            {/* Stock items table */}
            {showItems && (
                <Box sx={{ mb: 2.5 }}>
                    <StockItems />
                </Box>
            )}

            {/* Submit bar */}
            {!hideSubmitBar && (
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
            )}
        </Box>
    );
};

export default InventoryForm;
