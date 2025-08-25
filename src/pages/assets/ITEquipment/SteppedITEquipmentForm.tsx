/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState, useEffect } from "react";
import {
    Box,
    Divider,
    Grid,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
    alpha,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    Button as MuiButton,
    useMediaQuery,
    Alert
} from "@mui/material";
import { Controller } from "react-hook-form";
import { IITEquipmentForm } from "./interface";
import { IOptions } from "../../../components/tables/interface";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../core/routes/routes";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import { toast } from "react-toastify";
import CancelIcon from '@mui/icons-material/Cancel';

// Brand colors
const PRIMARY_COLOR = '#08796C';

const SteppedITEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    option,
    handleChange,
    formFields,
    computerFields,
    categories,
    selectedCategory,
    stateFormFields,
    isUpdate = false,
    loading = false,
    trigger
}: IITEquipmentForm) => {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [noFieldsError, setNoFieldsError] = useState(false);

    const steps = ['Basic Information', 'Technical Details'];

    useEffect(() => {
        const hasFormFields = formFields && formFields.length > 0;
        const hasStateFormFields = stateFormFields && stateFormFields.length > 0;


        setNoFieldsError(!hasFormFields || !hasStateFormFields);
    }, [stateFormFields, formFields]);

    // Helper to check if the form has errors in the current section
    const hasErrorsInStep = (stepIndex: number) => {
        const fields = getFieldsForStep(stepIndex);

        // If no fields, assume no errors
        if (!fields || fields.length === 0) {
            return false;
        }

        const fieldNames = fields.map((field: any) => field.value);

        // Check if any field in the current step has an error
        return Object.keys(formState.errors).some(errorField =>
            fieldNames.includes(errorField)
        );
    };

    const handleNext = () => {
        if (hasErrorsInStep(activeStep)) {
            // Get fields in the current step
            const fieldNames = getFieldsForStep(activeStep).map((field: any) => field.value);

            // Trigger validation for all fields in the current step
            fieldNames.forEach((fieldName: any) => {
                // Only validate if it's a string (some field values might be React nodes or other objects)
                if (typeof fieldName === 'string') {
                    trigger?.(fieldName as any);
                }
            });

            // Show error toast for better user feedback
            toast.error("Please fix the errors before proceeding to the next step");
            return;
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Divide fields into steps
    const getFieldsForStep = (step: number) => {

        // Check if we have form fields before proceeding
        if (!formFields || formFields.length === 0) {
            console.warn("No form fields available");
            return [];
        }

        // Always show category in first step
        const categoryField = formFields[0];

        // If no state form fields available, return just the category
        if (!stateFormFields || stateFormFields.length === 0) {
            console.warn("No state form fields available");
            return step === 0 ? [categoryField] : [];
        }

        // First step fields (basic information)
        if (step === 0) {
            // Return category and basic fields
            const basicFieldNames = [
                'assetName', 'assetType', 'assetStatus', 'branch', 'supplier',
                'assignedTo', 'purchaseCost', 'costOfTheAsset', 'description'
            ];

            const basicFields = stateFormFields.filter((field: any) =>
                basicFieldNames.includes(field.value as string)
            );

            return [categoryField, ...basicFields];
        }
        // Second step (technical details)
        else {
            // Return technical fields (everything else)
            const basicFieldNames = [
                'assetName', 'assetType', 'assetStatus', 'branch', 'supplier',
                'assignedTo', 'purchaseCost', 'costOfTheAsset', 'description'
            ];

            const technicalFields = stateFormFields.filter((field: any) =>
                !basicFieldNames.includes(field.value as string)
            );

            return technicalFields;
        }
    };

    // Get the fields for the current step
    const currentStepFields = getFieldsForStep(activeStep);

    useEffect(() => {
    }, [currentStepFields]);

    // Group form fields into sections
    const groupFields = (fields: any[] = []) => {
        // Define field groupings with their headers
        const groups = [
            {
                title: activeStep === 0 ? "Asset Information" : "Technical Specifications",
                icon: activeStep === 0 ? <DescriptionIcon fontSize="small" /> : <DevicesOtherIcon fontSize="small" />,
                fields: fields || []
            }
        ];

        return groups;
    };

    const fieldGroups = groupFields(currentStepFields);

    return (
        <Box sx={{ width: "100%" }}>
            {/* Stepper */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    bgcolor: alpha(PRIMARY_COLOR, 0.03)
                }}
            >
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel={isMobile}
                    sx={{
                        '& .MuiStepLabel-root .Mui-completed': {
                            color: PRIMARY_COLOR,
                        },
                        '& .MuiStepLabel-root .Mui-active': {
                            color: PRIMARY_COLOR,
                        },
                        '& .MuiStepConnector-line': {
                            borderColor: alpha('#000', 0.1)
                        },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                            borderColor: PRIMARY_COLOR,
                        },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                            borderColor: PRIMARY_COLOR,
                        },
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Display errors */}
            {noFieldsError && !loading && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    Unable to load form fields. Please try refreshing the page.
                </Alert>
            )}

            {/* Loading state */}
            {loading && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha('#000', 0.08)}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Typography>Loading form fields...</Typography>
                </Paper>
            )}

            {/* Form fields section */}
            {!loading && fieldGroups.map((group, groupIndex) => {

                // Skip empty groups
                if (!group.fields || group.fields.length === 0) {
                    return null;
                }

                return (
                    <Paper
                        key={`group-${groupIndex}`}
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            border: `1px solid ${alpha('#000', 0.08)}`,
                        }}
                    >
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 34,
                                    height: 34,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR
                                }}
                            >
                                {group.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                {group.title}
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {/* Category field special handling */}
                            {group.fields.some(field => field?.value === 'category') && (
                                <Grid item xs={12} md={6} lg={4}>
                                    <FormControl size='small' fullWidth>
                                        <InputLabel id="category">Select Category</InputLabel>
                                        <Controller
                                            control={control}
                                            name="category"
                                            rules={{ required: true }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <Select
                                                    required
                                                    labelId="category"
                                                    id="category"
                                                    value={value ?? selectedCategory}
                                                    label="Select Category"
                                                    onBlur={onBlur}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        onChange(selectedValue);
                                                        handleChange?.(e);
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: formState.errors.category ? 'error.main' : alpha('#000', 0.23),
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: formState.errors.category ? 'error.main' : alpha(PRIMARY_COLOR, 0.5),
                                                        },
                                                    }}
                                                >
                                                    {(formFields?.[0]?.options || []).map((option: IOptions) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                        {formState.errors.category && (
                                            <Typography variant="caption" color="error">
                                                Category is required
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Render other form fields */}
                            {group.fields
                                .filter(field => field && field.value !== 'category')
                                .map((field, index) => {
                                    // Safety check
                                    if (!field) return null;

                                    const commonProps = {
                                        register,
                                        control,
                                        formState,
                                        value: field.value,
                                        label: field.label,
                                        required: field.required === false ? field.required : true,
                                        disabled: field.disabled ? true : false
                                    };

                                    const gridSize = field.type === "textarea" ? { xs: 12 } : { xs: 12, md: 6, lg: 4 };

                                    return (
                                        <Grid item {...gridSize} key={`${field.value}-${index}`}>
                                            {field.type === "input" && <UseFormInput {...commonProps} />}
                                            {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                                            {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                                            {field.type === "select" && (
                                                <UseFormSelect {...commonProps} options={field.options} />
                                            )}
                                            {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                                            {field.type === "autocomplete" && (
                                                <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                                            )}
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    </Paper>
                );
            })}

            {/* No fields error/empty state */}
            {!loading && currentStepFields.length === 0 && !noFieldsError && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 2,
                        border: `1px dashed ${alpha('#000', 0.15)}`,
                        textAlign: 'center'
                    }}
                >
                    <Typography color="text.secondary">
                        No {activeStep === 0 ? 'basic' : 'technical'} fields available for this form.
                    </Typography>
                </Paper>
            )}

            {/* Navigation buttons */}
            <Box sx={{ mt: 3, mb: 2 }}>
                <Divider sx={{ mb: 3 }} />
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Box>
                        <MuiButton
                            onClick={() => navigate(ROUTES.LIST_ASSETS)}
                            color="inherit"
                            type="button"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            sx={{
                                borderColor: alpha('#000', 0.2),
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: alpha('#000', 0.3),
                                    backgroundColor: alpha('#000', 0.05)
                                }
                            }}
                        >
                            Back
                        </MuiButton>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        {activeStep > 0 && (
                            <MuiButton
                                onClick={handleBack}
                                color="primary"
                                type="button"
                                startIcon={<ArrowBackIcon />}
                                variant="outlined"
                            >
                                Previous
                            </MuiButton>
                        )}

                        {activeStep < steps.length - 1 && (
                            <MuiButton
                                onClick={handleNext}
                                color="primary"
                                type="button"
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                disabled={loading}
                            >
                                Next
                            </MuiButton>
                        )}

                        {activeStep === steps.length - 1 && (
                            <MuiButton
                                color="success"
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={sendingRequest || loading}
                            >
                                {buttonText || 'Submit'}
                            </MuiButton>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};

export default SteppedITEquipmentForm;