/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
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
    useTheme,
    Button as MuiButton,
    useMediaQuery,
} from "@mui/material";
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
import { toast } from "react-toastify";
import CancelIcon from '@mui/icons-material/Cancel';
import { IFleetForm } from "./interface";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
// Brand colors
const PRIMARY_COLOR = '#08796C';

const SteppedFleetForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    formFields,
    trigger,
}: IFleetForm) => {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Define form steps
    const steps = ['Basic Information', 'Additional Details'];

    // Helper to check if the form has errors in the current section
    const hasErrorsInStep = (stepIndex: number) => {
        const fields = getFieldsForStep(stepIndex);

        if (!fields || fields.length === 0) return false;

        const fieldNames = fields.map((field: any) => field.value);

        return Object.keys(formState.errors).some(errorField =>
            fieldNames.includes(errorField)
        );
    };

    const handleNext = async () => {
        // Validate current step fields before proceeding
        if (trigger) {
            const fieldsToValidate = getFieldsForStep(activeStep)
                .map((field: any) => field.value)
                .filter((fieldName: any) => typeof fieldName === 'string');

            const isValid = await trigger(fieldsToValidate as any[]);

            if (!isValid) {
                toast.error("Please fix the errors before proceeding");
                return;
            }
        } else if (hasErrorsInStep(activeStep)) {
            toast.error("Please fix the errors before proceeding");
            return;
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Divide fields into steps
    const getFieldsForStep = (step: number) => {
        if (!formFields || formFields.length === 0) {
            return [];
        }

        // Define which fields belong in which step
        const basicFields = [
            'assetName', 'assetType', 'category', 'assetStatus', 'branch',
            'supplier', 'assignedTo', 'purchaseCost', 'costOfTheAsset'
        ];

        if (step === 0) {
            return formFields.filter((field: any) =>
                basicFields.includes(field.value as string)
            );
        } else {
            return formFields.filter((field: any) =>
                !basicFields.includes(field.value as string)
            );
        }
    };

    // Get the fields for the current step
    const currentStepFields = getFieldsForStep(activeStep);

    // Group form fields into sections
    const groupFields = (fields: any[] = []) => {
        return [
            {
                title: activeStep === 0 ? "Asset Information" : "Additional Details",
                icon: activeStep === 0 ? <DescriptionIcon fontSize="small" /> : <DirectionsCarIcon fontSize="small" />,
                fields: fields || []
            }
        ];
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

            {/* Form fields section */}
            {fieldGroups.map((group, groupIndex) => {
                // Skip empty groups
                if (!group.fields || group.fields.length === 0) {
                    return (
                        <Paper
                            key={`group-${groupIndex}`}
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
                                No {activeStep === 0 ? 'basic' : 'additional'} fields available for this form.
                            </Typography>
                        </Paper>
                    );
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
                            {/* Render form fields */}
                            {group.fields.map((field, index) => {
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

                                const gridSize = field.type === "textarea" ?
                                    { xs: 12 } : { xs: 12, md: 6, lg: 4 };

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
                            })}
                        </Grid>
                    </Paper>
                );
            })}

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
                            onClick={() => navigate(ROUTES.LIST_FLEET)}
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
                                disabled={sendingRequest}
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

export default SteppedFleetForm;