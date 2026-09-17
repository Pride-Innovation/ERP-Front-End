/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { useState } from "react";
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
import { IOfficeEquipmentForm } from "../interface";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms";
import { PageSection } from "../../../components/layout";
import { brand, neutral, border } from "../../../utils/tokens";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import ChairIcon from '@mui/icons-material/Chair';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from "react-toastify";

const P = brand[500];

const SteppedOfficeEquipmentForm = ({
    formState,
    control,
    register,
    buttonText,
    secondaryButtonText,
    onSecondaryIntent,
    sendingRequest,
    formFields,
    trigger,
    isUpdate,
}: IOfficeEquipmentForm) => {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fields that make up the "Technical Details" step. The step is only shown when
    // the category enables at least one of them via fieldConfig.
    const technicalFields = [
        'hostname', 'serialNumber', 'description', 'ram', 'cpuSpeed',
        'hardDiskSize', 'macAddress', 'ipAddress', 'interfaceType',
    ];
    const hasTechnical = (formFields || []).some((f: any) => technicalFields.includes(f.value as string));

    // Define form steps — "Technical Details" is appended only when relevant.
    const steps = hasTechnical
        ? ['Basic Information', 'Additional Details', 'Technical Details']
        : ['Basic Information', 'Additional Details'];

    const stepMeta = [
        { title: 'Asset Information', subtitle: 'Identity, classification and cost', icon: <DescriptionIcon fontSize="small" /> },
        { title: 'Additional Details', subtitle: 'Valuation, references and dates', icon: <ChairIcon fontSize="small" /> },
        { title: 'Technical Details', subtitle: 'Hardware, network and specifications', icon: <MemoryOutlinedIcon fontSize="small" /> },
    ];

    const hasErrorsInStep = (stepIndex: number) => {
        const fields = getFieldsForStep(stepIndex);
        if (!fields || fields.length === 0) return false;
        const fieldNames = fields.map((field: any) => field.value);
        return Object.keys(formState.errors).some(errorField => fieldNames.includes(errorField));
    };

    const handleNext = async () => {
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
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    /**
     * The step-through and submit action. It is ALWAYS a plain button (never type="submit"), so
     * neither a click on a non-final step nor an Enter keypress can ever submit the form. Submission
     * only happens here, and only when we are genuinely on the last step — guarding against the case
     * where the step count changes (e.g. the "Technical Details" step appears/disappears as the
     * category field-config loads).
     *
     * <p>Shared by both final-step buttons where there are two. The difference between "Save" and
     * "Save and add another" is entirely what the *page* does afterwards, so the second button
     * announces its intent and then takes this identical path — rather than carrying a second copy
     * of the step logic, the validation and the `requestSubmit`, which is how two buttons that should
     * behave the same come to disagree about which fields they check.
     */
    const handlePrimaryAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const isLast = activeStep === steps.length - 1;
        if (!isLast) {
            await handleNext();
            return;
        }
        // Capture the form element synchronously — React nulls out the synthetic event's
        // currentTarget after the first `await`, so we must grab it before validating.
        const form = e.currentTarget.closest('form');

        // On the last step: validate its fields for a friendly message, then submit the parent form.
        let valid = true;
        if (trigger) {
            const fieldsToValidate = getFieldsForStep(activeStep)
                .map((field: any) => field.value)
                .filter((fieldName: any) => typeof fieldName === 'string');
            valid = await trigger(fieldsToValidate as any[]);
        } else {
            valid = !hasErrorsInStep(activeStep);
        }
        if (!valid) {
            toast.error("Please fix the errors before proceeding");
            return;
        }
        form?.requestSubmit();
    };

    // Divide fields into steps
    const getFieldsForStep = (step: number) => {
        if (!formFields || formFields.length === 0) return [];

        const basicFields = [
            'assetName', 'assetType', 'category', 'assetStatus', 'branch',
            'supplier', 'assignedTo', 'purchaseCost', 'costOfTheAsset'
        ];

        if (step === 0) {
            return formFields.filter((field: any) => basicFields.includes(field.value as string));
        }

        if (hasTechnical && step === 2) {
            return formFields.filter((field: any) => technicalFields.includes(field.value as string));
        }

        // "Additional Details" — everything that isn't a basic or a technical field.
        return formFields.filter((field: any) =>
            !basicFields.includes(field.value as string)
            && !technicalFields.includes(field.value as string)
        );
    };

    const currentStepFields = getFieldsForStep(activeStep);
    const meta = stepMeta[activeStep] ?? stepMeta[1];
    const progressPct = ((activeStep + 1) / steps.length) * 100;

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${border.subtle}`,
                bgcolor: '#fff',
            }}
        >
            {/* ── Header ── */}
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.5, borderBottom: `1px solid ${border.subtle}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha(P, 0.1), color: brand[600], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Inventory2OutlinedIcon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25 }}>
                        {isUpdate ? 'Update Asset' : 'Register Asset'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                        {isUpdate
                            ? 'Modify the details of this asset record'
                            : 'Complete each step to register a new asset'}
                    </Typography>
                </Box>
            </Box>

            {/* ── Stepper strip ── */}
            <Box sx={{ px: { xs: 1.5, md: 3.5 }, py: 2, bgcolor: '#FAFBFC', borderBottom: `1px solid ${border.subtle}` }}>
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel={isMobile}
                    sx={{
                        '& .MuiStepIcon-root': { color: neutral[200], '& text': { fill: neutral[500], fontWeight: 700 } },
                        '& .MuiStepIcon-root.Mui-active': { color: P, '& text': { fill: '#fff' } },
                        '& .MuiStepIcon-root.Mui-completed': { color: brand[600] },
                        '& .MuiStepLabel-label': { fontSize: '0.8rem', color: neutral[500], mt: isMobile ? 0.5 : 0 },
                        '& .MuiStepLabel-label.Mui-active': { color: brand[700], fontWeight: 700 },
                        '& .MuiStepLabel-label.Mui-completed': { color: neutral[700], fontWeight: 600 },
                        '& .MuiStepConnector-line': { borderColor: border.subtle, borderTopWidth: 2 },
                        '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: P },
                        '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: brand[600] },
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>
            </Box>

            {/* ── Body ── */}
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
                {currentStepFields.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', borderRadius: 2, border: `1px dashed ${neutral[200]}` }}>
                        <Typography variant="body2" sx={{ color: neutral[500] }}>
                            No fields available for this section.
                        </Typography>
                    </Box>
                ) : (
                    <PageSection title={meta.title} subtitle={meta.subtitle} icon={meta.icon} mb={0}>
                        <Grid container spacing={2.5}>
                            {currentStepFields.map((field: any, index: number) => {
                                if (!field) return null;
                                const commonProps = {
                                    register,
                                    control,
                                    formState,
                                    value: field.value,
                                    label: field.label,
                                    required: field.required === false ? field.required : true,
                                    disabled: field.disabled || (isUpdate && field.disabledOnUpdate) ? true : false,
                                };
                                const gridSize = field.type === "textarea" ? { xs: 12 } : { xs: 12, sm: 6 };

                                return (
                                    <Grid item {...gridSize} key={`${field.value}-${index}`}>
                                        {field.type === "input" && <UseFormInput {...commonProps} />}
                                        {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                                        {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                                        {field.type === "select" && <UseFormSelect {...commonProps} options={field.options} />}
                                        {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                                        {field.type === "autocomplete" && <UseFormAutocompleteComponent {...commonProps} options={field.options} />}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </PageSection>
                )}
            </Box>

            {/* ── Footer ── */}
            <Box sx={{ borderTop: `1px solid ${border.subtle}` }}>
                {/* progress */}
                <Box sx={{ height: 3, bgcolor: alpha(P, 0.1) }}>
                    <Box sx={{ height: '100%', width: `${progressPct}%`, bgcolor: P, transition: 'width 0.4s ease' }} />
                </Box>

                <Box
                    sx={{
                        px: { xs: 2, md: 3.5 },
                        py: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                        bgcolor: '#FAFBFC',
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <MuiButton
                            onClick={() => navigate(-1)}
                            type="button"
                            variant="text"
                            startIcon={<CloseIcon fontSize="small" />}
                            sx={{
                                color: neutral[500], textTransform: 'none', fontSize: '0.82rem', borderRadius: '8px',
                                '&:hover': { color: '#D32F2F', bgcolor: alpha('#D32F2F', 0.06) },
                            }}
                        >
                            Cancel
                        </MuiButton>
                        <Typography variant="caption" sx={{ color: neutral[400], display: { xs: 'none', sm: 'block' } }}>
                            Step {activeStep + 1} of {steps.length} · <Box component="span" sx={{ color: brand[700], fontWeight: 600 }}>{steps[activeStep]}</Box>
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {activeStep > 0 && (
                            <MuiButton
                                onClick={handleBack}
                                type="button"
                                variant="outlined"
                                startIcon={<ArrowBackIcon fontSize="small" />}
                                sx={{
                                    flex: { xs: 1, sm: 'initial' }, height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                    borderColor: alpha(P, 0.4), color: brand[600],
                                    '&:hover': { borderColor: P, bgcolor: alpha(P, 0.05) },
                                }}
                            >
                                Previous
                            </MuiButton>
                        )}

                        {/*
                          * "Save and add another" — only where a page asked for it, and only on the
                          * last step, where saving is what the other button does too.
                          *
                          * Rendered before the primary so the emphasised action sits last, which is
                          * where the eye finishes. It calls `onSecondaryIntent` and then the very
                          * same handler, so the validation and submission it performs are not a
                          * second implementation of them.
                          */}
                        {secondaryButtonText && activeStep === steps.length - 1 && (
                            <MuiButton
                                onClick={(e) => { onSecondaryIntent?.(); return handlePrimaryAction(e); }}
                                type="button"
                                variant="outlined"
                                startIcon={<AddIcon fontSize="small" />}
                                disabled={sendingRequest}
                                sx={{
                                    flex: { xs: 1, sm: 'initial' }, height: 40, borderRadius: '8px',
                                    textTransform: 'none', fontWeight: 600,
                                    borderColor: alpha(P, 0.4), color: brand[600],
                                    '&:hover': { borderColor: P, bgcolor: alpha(P, 0.05) },
                                }}
                            >
                                {secondaryButtonText}
                            </MuiButton>
                        )}

                        {(() => {
                            const isLastStep = activeStep === steps.length - 1;
                            return (
                                <MuiButton
                                    onClick={handlePrimaryAction}
                                    type="button"
                                    variant="contained"
                                    endIcon={!isLastStep ? <ArrowForwardIcon fontSize="small" /> : undefined}
                                    startIcon={isLastStep ? <SaveIcon fontSize="small" /> : undefined}
                                    disabled={isLastStep && sendingRequest}
                                    sx={{
                                        flex: { xs: 1, sm: 'initial' }, height: 40, minWidth: isLastStep ? 160 : 140, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                        bgcolor: P, boxShadow: `0 2px 8px ${alpha(P, 0.3)}`,
                                        '&:hover': { bgcolor: '#065f54', boxShadow: `0 4px 14px ${alpha(P, 0.4)}` },
                                        '&.Mui-disabled': { bgcolor: alpha(P, 0.45), color: '#fff' },
                                    }}
                                >
                                    {isLastStep ? (sendingRequest ? 'Saving…' : (buttonText || 'Save Asset')) : 'Continue'}
                                </MuiButton>
                            );
                        })()}
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
};

export default SteppedOfficeEquipmentForm;
