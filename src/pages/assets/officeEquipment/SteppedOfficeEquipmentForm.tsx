/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
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
    useTheme,
    Button as MuiButton,
    useMediaQuery,
    Alert
} from "@mui/material";
import { IOfficeEquipmentForm } from "./interface";
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
import ChairIcon from '@mui/icons-material/Chair';
import { toast } from "react-toastify";
import CancelIcon from '@mui/icons-material/Cancel';

// Brand colors
const PRIMARY_COLOR = '#08796C';

const SteppedOfficeEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
    formFields,
    isUpdate = false,
    trigger,
    lpoParams,
    userParams,
    supplierParams,
    branchParams
}: IOfficeEquipmentForm) => {
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
                icon: activeStep === 0 ? <DescriptionIcon fontSize="small" /> : <ChairIcon fontSize="small" />,
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
                            onClick={() => navigate(ROUTES.LIST_OFFICE_EQUIPMENT)}
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
                                disabled={sendingRequest}
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

export default SteppedOfficeEquipmentForm;