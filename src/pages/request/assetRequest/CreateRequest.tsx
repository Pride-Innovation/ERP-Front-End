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
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { brand, neutral, border, surface, elevation, radii, status } from "../../../utils/tokens";
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

const P = brand[500];

const initialData: RowData[] = [
    { id: 1, name: '', groupName: '', quantity: 0 },
];

/** Where this form sits in the request lifecycle. Rendered as the rail below the title. */
const LIFECYCLE = [
    { label: 'Start Request',   icon: <NoteAddOutlinedIcon sx={{ fontSize: 14 }} /> },
    { label: 'Fill Details',    icon: <ChecklistOutlinedIcon sx={{ fontSize: 14 }} /> },
    { label: 'Review & Submit', icon: <RateReviewOutlinedIcon sx={{ fontSize: 14 }} /> },
    { label: 'Approval',        icon: <HowToVoteOutlinedIcon sx={{ fontSize: 14 }} /> },
];

/** The fields the hero checklist tracks, with their live done-state. */
function buildChecklist(formData: Partial<IRequest>, rows: RowData[]) {
    return [
        { label: 'Title',       done: Boolean(formData.name) },
        { label: 'Priority',    done: Boolean(formData.priority) },
        { label: 'Description', done: Boolean(formData.description) },
        { label: 'Items',       done: rows.some(r => r.name && r.quantity > 0) },
    ];
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
    const checklist = buildChecklist(formValues, rows);
    const doneCount = checklist.filter(c => c.done).length;
    const formProgress = Math.round((doneCount / checklist.length) * 100);

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
                    borderRadius: `${radii.lg}px`,
                    border: `1px solid ${border.subtle}`,
                    bgcolor: surface.card,
                    overflow: 'hidden',
                    boxShadow: elevation.card,
                }}
            >
                {/* Title row */}
                <Box sx={{
                    px: { xs: 2.5, sm: 3.5 },
                    py: 2.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}>
                    {/* Left — icon + title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            bgcolor: alpha(P, 0.08),
                            border: `1px solid ${alpha(P, 0.18)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <NoteAddOutlinedIcon sx={{ fontSize: 22, color: brand[600] }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                Create New Request
                            </Typography>
                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
                                Fill in the details below to submit a new asset request
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right — live field checklist */}
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ mb: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
                        >
                            <Typography sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: neutral[400],
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}>
                                Completion
                            </Typography>
                            <Typography sx={{
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                fontVariantNumeric: 'tabular-nums',
                                color: isDone ? status.success.strong : brand[700],
                            }}>
                                {formProgress}%
                            </Typography>
                            {isDone && (
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: status.success.strong }}>
                                    · Ready to submit
                                </Typography>
                            )}
                        </Stack>

                        {/* One pip per tracked field — lights up as it's filled */}
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            {checklist.map((item) => (
                                <Stack
                                    key={item.label}
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{
                                        px: 1,
                                        py: 0.4,
                                        borderRadius: `${radii.pill}px`,
                                        border: `1px solid ${item.done ? alpha(P, 0.35) : border.default}`,
                                        bgcolor: item.done ? alpha(P, 0.07) : 'transparent',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    {item.done ? (
                                        <CheckRoundedIcon sx={{ fontSize: 12, color: brand[600] }} />
                                    ) : (
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: neutral[300], mx: '3px' }} />
                                    )}
                                    <Typography sx={{
                                        fontSize: '0.68rem',
                                        fontWeight: 600,
                                        color: item.done ? brand[700] : neutral[500],
                                    }}>
                                        {item.label}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Lifecycle rail — advances to "Review & Submit" once the form is complete */}
                <Box sx={{
                    px: { xs: 2.5, sm: 3.5 },
                    py: 1.5,
                    borderTop: `1px solid ${border.subtle}`,
                    bgcolor: surface.muted,
                    overflowX: 'auto',
                }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 'max-content' }}>
                        {LIFECYCLE.map((step, idx) => {
                            const activeIdx = isDone ? 2 : 1;
                            const state = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'todo';
                            return (
                                <Stack key={step.label} direction="row" alignItems="center" spacing={1}>
                                    {idx > 0 && (
                                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 10, color: neutral[300] }} />
                                    )}
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.75}
                                        sx={{
                                            px: 1.25,
                                            py: 0.5,
                                            borderRadius: `${radii.pill}px`,
                                            transition: 'all 0.25s ease',
                                            ...(state === 'active' && { bgcolor: P, color: '#fff' }),
                                            ...(state === 'done' && { bgcolor: alpha(P, 0.08), color: brand[700] }),
                                            ...(state === 'todo' && { color: neutral[400] }),
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', color: 'inherit' }}>
                                            {state === 'done' ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : step.icon}
                                        </Box>
                                        <Typography sx={{
                                            fontSize: '0.72rem',
                                            fontWeight: state === 'active' ? 700 : 600,
                                            color: 'inherit',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {step.label}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
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
