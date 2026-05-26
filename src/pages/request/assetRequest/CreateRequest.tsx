/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    Container,
    Typography,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    alpha,
} from "@mui/material";
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import RequestForm from "./RequestForm";
import { IRequest, IRequestAxiosResponse } from "../interface";
import { requestSchema } from "./schema";
import { RequestContext } from "../../../context/request/RequestContext";
import { validateInventoryItems } from "../../../utils/helpers";
import { toast } from "react-toastify";
import { createAssetRequestService } from "./service";
import { RowData } from "../../../components/forms/interface";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";

const P = '#08796C';

const initialData: RowData[] = [
    { id: 1, name: '', groupName: '', quantity: 0 },
];

const STEPS = [
    { label: 'Start Request',    icon: <NoteAddOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Fill Details',     icon: <ChecklistOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Review & Submit',  icon: <RateReviewOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Approval',         icon: <HowToVoteOutlinedIcon sx={{ fontSize: 16 }} /> },
];

function calculateFormProgress(formData: Partial<IRequest>, rows: RowData[]): number {
    let total = 4;
    let done = 0;
    if (formData.name) done++;
    if (formData.priority) done++;
    if (formData.description) done++;
    if (rows.some(r => r.name && r.quantity > 0)) done++;
    return Math.round((done / total) * 100);
}

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const [signature, setSignature] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { rows, setRows } = useContext(RequestContext);
    const navigate = useNavigate();

    useEffect(() => { setRows(initialData); }, [setRows]);

    const { control, handleSubmit, formState, register, reset, watch, setValue } = useForm<IRequest>({
        mode: 'onChange',
        resolver: yupResolver(requestSchema),
    });

    const formValues = watch();
    const formProgress = calculateFormProgress(formValues, rows);

    useEffect(() => { reset({} as IRequest); }, [reset]);

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const result = validateInventoryItems(rows);

        if (result.isValid && result.validData) {
            const payload = new FormData();
            payload.append("priority", formData.priority);
            payload.append("name", formData.name);
            payload.append("description", formData.description as string);

            if (formData.assetTypeId != null && formData.assetTypeId !== '') {
                payload.append("assetTypeId", String(formData.assetTypeId));
            }
            if (formData.attributes && Object.keys(formData.attributes).length > 0) {
                payload.append("attributes", JSON.stringify(formData.attributes));
            }
            if (file) payload.append("file", file);

            payload.append(
                "requestCommodities",
                JSON.stringify(result.validData.map(item => ({ commodityId: item.id, quantity: item.quantity }))),
            );

            try {
                const response = await createAssetRequestService(payload) as IRequestAxiosResponse;
                if (response.status === 201) {
                    toast.success("Request created successfully");
                    reset({} as IRequest);
                    setFile(null);
                    setSignature("");
                    setRows(initialData);
                    navigate(ROUTES.REQUEST);
                }
            } catch {
                toast.error("Failed to create request. Please try again.");
            }
        } else {
            toast.error(`Requests validation errors: ${result.errors}`);
        }
        setSendingRequest(false);
    };

    const isDone = formProgress === 100;

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>

            {/* ── Page header card ───────────────────────────────────── */}
            <Box
                sx={{
                    mb: 3,
                    borderRadius: '12px',
                    border: '1px solid #E8EDF3',
                    bgcolor: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
            >
                {/* Top accent stripe */}
                <Box sx={{ height: 4, bgcolor: P }} />

                {/* Title row */}
                <Box sx={{
                    px: { xs: 2.5, sm: 3.5 },
                    pt: 2.5,
                    pb: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}>
                    {/* Left — icon + title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: alpha(P, 0.1),
                            border: `1.5px solid ${alpha(P, 0.2)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <NoteAddOutlinedIcon sx={{ fontSize: 24, color: P }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0F172A', lineHeight: 1.3 }}>
                                Create New Request
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
                                Fill in the details below to submit a new asset request
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right — progress pill */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: { xs: 'flex-start', sm: 'flex-end' },
                        gap: 0.5,
                        flexShrink: 0,
                        minWidth: 160,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Completion
                            </Typography>
                            <Typography sx={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: isDone ? '#16A34A' : P,
                                ml: 1,
                            }}>
                                {formProgress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={formProgress}
                            sx={{
                                height: 6,
                                width: '100%',
                                borderRadius: 3,
                                bgcolor: '#F1F5F9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: isDone ? '#16A34A' : P,
                                    borderRadius: 3,
                                    transition: 'width 0.4s ease',
                                },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.7rem', color: isDone ? '#16A34A' : '#94A3B8' }}>
                            {isDone ? 'Ready to submit' : `${4 - Math.round(formProgress / 25)} fields remaining`}
                        </Typography>
                    </Box>
                </Box>

                {/* Stepper */}
                <Box sx={{
                    px: { xs: 2, sm: 3.5 },
                    py: 1.75,
                    borderTop: '1px solid #F1F5F9',
                    bgcolor: '#FAFBFC',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { height: 3 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 },
                }}>
                    <Stepper
                        activeStep={1}
                        alternativeLabel
                        sx={{
                            minWidth: 320,
                            '& .MuiStepIcon-root': {
                                color: '#E2E8F0',
                                '& text': { fill: '#94A3B8', fontSize: '0.7rem', fontWeight: 700 },
                            },
                            '& .MuiStepIcon-root.Mui-active': {
                                color: P,
                                '& text': { fill: '#fff' },
                            },
                            '& .MuiStepIcon-root.Mui-completed': {
                                color: P,
                            },
                            '& .MuiStepConnector-line': {
                                borderColor: '#E2E8F0',
                                borderTopWidth: 2,
                            },
                            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                                borderColor: P,
                            },
                            '& .MuiStepLabel-label': {
                                fontSize: '0.72rem',
                                color: '#94A3B8',
                                mt: 0.5,
                            },
                            '& .MuiStepLabel-label.Mui-active': {
                                color: P,
                                fontWeight: 700,
                            },
                            '& .MuiStepLabel-label.Mui-completed': {
                                color: P,
                                fontWeight: 600,
                            },
                        }}
                    >
                        {STEPS.map((step, idx) => (
                            <Step key={idx} completed={idx === 0} active={idx === 1}>
                                <StepLabel>{step.label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </Box>

            {/* ── Main form ──────────────────────────────────────────── */}
            <Box component="form" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <RequestForm
                    setFile={setFile}
                    file={file}
                    setImage={setSignature}
                    image={signature}
                    formState={formState}
                    control={control}
                    register={register}
                    setValue={setValue}
                    sendingRequest={sendingRequest}
                    buttonText="Submit Request"
                />
            </Box>
        </Container>
    );
};

export default CreateRequest;
