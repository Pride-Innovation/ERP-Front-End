/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState, useEffect } from "react";
import {
    Box,
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
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                            bgcolor: alpha(PRIMARY_COLOR, 0.015),
                            boxShadow: `0 1px 3px ${alpha('#000', 0.04)}`
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
                            <Typography variant="h6" fontWeight={700} sx={{ color: PRIMARY_COLOR }}>
                                {group.title}
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {/* Category field special handling */}
                            {group.fields.some(field => field?.value === 'category') && (
                                <Grid item xs={12} md={6} lg={4}>
                                    <FormControl size='medium' fullWidth sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            backgroundColor: '#FAFAFA',
                                            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: formState.errors.category ? '#D32F2F' : alpha(PRIMARY_COLOR, 0.5),
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#fff',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: '1.5px',
                                                    boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.09)}`,
                                                },
                                            },
                                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#D32F2F',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: formState.errors.category ? '#D32F2F' : 'rgba(0, 0, 0, 0.18)',
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'rgba(0, 0, 0, 0.45)',
                                            fontSize: '0.875rem',
                                            '&.Mui-focused': { color: PRIMARY_COLOR },
                                            '&.Mui-error': { color: '#D32F2F' },
                                        },
                                        '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
                                            transform: 'translate(14px, 13px) scale(1)',
                                        },
                                        '& .MuiSelect-select.MuiInputBase-input': {
                                            padding: '13px 32px 13px 14px',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.5,
                                        },
                                    }}>
                                        <InputLabel id="category" error={Boolean(formState.errors.category)}>Select Category</InputLabel>
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
                                                    error={Boolean(formState.errors.category)}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        onChange(selectedValue);
                                                        handleChange?.(e);
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            elevation: 3,
                                                            sx: {
                                                                mt: 0.5,
                                                                borderRadius: '8px',
                                                                boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
                                                                '& .MuiMenuItem-root': {
                                                                    fontSize: '0.875rem',
                                                                    py: 1,
                                                                    '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
                                                                    '&.Mui-selected': {
                                                                        backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                                                                        color: PRIMARY_COLOR,
                                                                        fontWeight: 500,
                                                                        '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.14) },
                                                                    },
                                                                },
                                                            },
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
            <Paper
                elevation={0}
                sx={{
                    mt: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    overflow: 'hidden',
                }}
            >
                {/* Step progress bar */}
                <Box
                    sx={{
                        height: 3,
                        background: `linear-gradient(90deg, ${PRIMARY_COLOR} ${((activeStep + 1) / steps.length) * 100}%, ${alpha(PRIMARY_COLOR, 0.12)} ${((activeStep + 1) / steps.length) * 100}%)`,
                        transition: 'all 0.4s ease',
                    }}
                />

                <Box
                    sx={{
                        px: 3,
                        py: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        bgcolor: alpha(PRIMARY_COLOR, 0.015),
                    }}
                >
                    {/* Left: step info + cancel */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <MuiButton
                            onClick={() => navigate(ROUTES.LIST_ASSETS)}
                            type="button"
                            variant="text"
                            startIcon={<CancelIcon fontSize="small" />}
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.8125rem',
                                px: 1.5,
                                py: 1,
                                borderRadius: '8px',
                                '&:hover': {
                                    color: '#D32F2F',
                                    backgroundColor: alpha('#D32F2F', 0.06),
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Cancel
                        </MuiButton>

                        <Box
                            sx={{
                                height: 20,
                                width: '1px',
                                bgcolor: alpha('#000', 0.12),
                                display: { xs: 'none', sm: 'block' },
                            }}
                        />

                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            Step {activeStep + 1} of {steps.length} &mdash; <strong style={{ color: PRIMARY_COLOR }}>{steps[activeStep]}</strong>
                        </Typography>
                    </Stack>

                    {/* Right: navigation */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {activeStep > 0 && (
                            <MuiButton
                                onClick={handleBack}
                                type="button"
                                variant="outlined"
                                startIcon={<ArrowBackIcon fontSize="small" />}
                                sx={{
                                    borderColor: alpha(PRIMARY_COLOR, 0.4),
                                    color: PRIMARY_COLOR,
                                    fontSize: '0.8125rem',
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        borderColor: PRIMARY_COLOR,
                                        backgroundColor: alpha(PRIMARY_COLOR, 0.06),
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Previous
                            </MuiButton>
                        )}

                        {activeStep < steps.length - 1 && (
                            <MuiButton
                                onClick={handleNext}
                                type="button"
                                variant="contained"
                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                disabled={loading}
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    fontSize: '0.8125rem',
                                    px: 3,
                                    py: 1,
                                    borderRadius: '8px',
                                    boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                    '&:hover': {
                                        bgcolor: '#065f54',
                                        boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.45)}`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                    '&.Mui-disabled': { bgcolor: alpha('#000', 0.12), boxShadow: 'none' },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Continue
                            </MuiButton>
                        )}

                        {activeStep === steps.length - 1 && (
                            <MuiButton
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon fontSize="small" />}
                                disabled={sendingRequest || loading}
                                sx={{
                                    bgcolor: PRIMARY_COLOR,
                                    fontSize: '0.8125rem',
                                    px: 3,
                                    py: 1,
                                    borderRadius: '8px',
                                    boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                    '&:hover': {
                                        bgcolor: '#065f54',
                                        boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.45)}`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:active': { transform: 'translateY(0)' },
                                    '&.Mui-disabled': { bgcolor: alpha('#000', 0.12), boxShadow: 'none' },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {buttonText || 'Save Asset'}
                            </MuiButton>
                        )}
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default SteppedITEquipmentForm;