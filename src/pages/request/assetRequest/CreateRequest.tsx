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
    Divider,
    Typography,
    LinearProgress,
    Stepper,
    Step,
    StepLabel,
    Card,
    useTheme,
    useMediaQuery,
    alpha,
    Avatar
} from "@mui/material";
import RequestForm from "./RequestForm";
import { IRequest, IRequestAxiosResponse } from "../interface";
import { requestSchema } from "./schema";
import { RequestContext } from "../../../context/request/RequestContext";
import { validateInventoryItems } from "../../../utils/helpers";
import { toast } from "react-toastify";
import { createAssetRequestService } from "./service";
import { RowData } from "../../../components/forms/interface";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";

const initialData: RowData[] = [
    { id: 1, name: '', groupName: '', quantity: 0 },
];

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green
// 

const CreateRequest = () => {
    const [sendingRequest, setSendingRequest] = useState(false);
    const [signature, setSignature] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const { rows, setRows } = useContext(RequestContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => { setRows(initialData) }, [setRows]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        watch
    } = useForm<IRequest>({
        mode: 'onChange',
        resolver: yupResolver(requestSchema),
    });

    // Watch form values to determine completion percentage
    const formValues = watch();
    const formProgress = calculateFormProgress(formValues, rows);
    const navigate = useNavigate();

    useEffect(() => {
        reset({} as IRequest);
    }, [reset]);

    // Calculate form completion percentage
    function calculateFormProgress(formData: Partial<IRequest>, rows: RowData[]): number {
        let totalFields = 3; // Required fields: name, priority, description
        let completedFields = 0;

        if (formData.name) completedFields++;
        if (formData.priority) completedFields++;
        if (formData.description) completedFields++;

        // Consider item selection as well
        const validItems = rows.filter(row => row.name && row.quantity > 0);
        if (validItems.length > 0) completedFields++;
        totalFields++;

        return Math.round((completedFields / totalFields) * 100);
    }

    const onSubmit = async (formData: IRequest) => {
        setSendingRequest(true);
        const result = validateInventoryItems(rows);

        if (result.isValid && result.validData) {
            const payload = new FormData();
            payload.append("priority", formData.priority);
            payload.append("name", formData.name);
            payload.append("description", formData.description as string);

            if (file) payload.append("file", file);

            const formattedCommodities = result.validData.map(item => ({
                commodityId: item.id,
                quantity: item.quantity
            }));

            payload.append("requestCommodities", JSON.stringify(formattedCommodities));

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
            } catch (error) {
                console.log(error);
                toast.error("Failed to create request. Please try again.");
            }
        } else {
            toast.error(`Requests validation errors: ${result.errors}`);
        }
        setSendingRequest(false);
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#000', 0.08),
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        background: `linear-gradient(to right, ${alpha(PRIMARY_COLOR, 0.02)}, ${alpha(PRIMARY_COLOR, 0.08)})`,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                bgcolor: alpha(PRIMARY_COLOR, 0.12),
                                color: PRIMARY_COLOR,
                                mr: 2,
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 }
                            }}
                        >
                            <AddCircleOutlineIcon />
                        </Avatar>
                        <Box>
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    fontWeight: 600,
                                    color: PRIMARY_COLOR,
                                    mb: 0.5
                                }}
                            >
                                Create New Request
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: alpha('#000', 0.6) }}
                            >
                                Fill in the details below to submit a new asset request
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
                        <Typography variant="caption" sx={{ color: alpha('#000', 0.5), fontWeight: 500, display: 'block' }}>
                            Form Completion
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={formProgress}
                            sx={{
                                my: 0.5,
                                height: 6,
                                width: { xs: '100%', sm: 120 },
                                borderRadius: 3,
                                bgcolor: alpha(PRIMARY_COLOR, 0.12),
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: formProgress === 100 ? '#4caf50' : PRIMARY_COLOR,
                                    borderRadius: 3,
                                },
                            }}
                        />
                        <Typography variant="caption" sx={{ color: formProgress === 100 ? '#2e7d32' : PRIMARY_COLOR, fontWeight: 600 }}>
                            {formProgress}% Complete
                        </Typography>
                    </Box>
                </Box>

                {/* Process steps */}
                <Divider />
                <Box sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                        height: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: alpha('#000', 0.05),
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#000', 0.2),
                        borderRadius: '4px',
                    }
                }}>
                    <Stepper
                        activeStep={1}
                        alternativeLabel
                        sx={{
                            minWidth: isTablet ? 360 : 'auto',
                            '& .MuiStepIcon-root': { color: alpha(PRIMARY_COLOR, 0.25) },
                            '& .MuiStepIcon-root.Mui-active': { color: PRIMARY_COLOR },
                            '& .MuiStepIcon-root.Mui-completed': { color: PRIMARY_COLOR },
                            '& .MuiStepConnector-line': { borderColor: alpha(PRIMARY_COLOR, 0.2) },
                            '& .MuiStepLabel-label': { fontSize: { xs: 11, sm: 13 } },
                            '& .MuiStepLabel-label.Mui-active': { color: PRIMARY_COLOR, fontWeight: 600 },
                            '& .MuiStepLabel-label.Mui-completed': { color: PRIMARY_COLOR },
                        }}
                    >
                        <Step completed>
                            <StepLabel>Start Request</StepLabel>
                        </Step>
                        <Step active>
                            <StepLabel>Fill Details</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Review & Submit</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Approval</StepLabel>
                        </Step>
                    </Stepper>
                </Box>
            </Card>

            {/* Main Form Section */}
            <Box
                component="form"
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
            >
                <RequestForm
                    setFile={setFile}
                    file={file}
                    setImage={setSignature}
                    image={signature}
                    formState={formState}
                    control={control}
                    register={register}
                    sendingRequest={sendingRequest}
                    buttonText="Submit Request"
                />
            </Box>


        </Container>
    );
};

export default CreateRequest;