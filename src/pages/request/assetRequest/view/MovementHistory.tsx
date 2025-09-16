import React, { useContext, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Chip,
    Avatar,
    useTheme,
    useMediaQuery,
    alpha,
} from '@mui/material';
import {
    History as HistoryIcon,
} from '@mui/icons-material';
import { IRequest, IRequestReport, IRequestReportAxiosResponse } from '../../interface';
import MovementStage from './MovementStage';
import { findRequestReportByRequestService } from '../service';
import { RequestContext } from '../../../../context/request/RequestContext';

// Brand colors (consistent with other components)
const PRIMARY_COLOR = '#08796C';
const ACCENT_COLOR = '#BC892C';

// Define the data structure for movement history
export interface MovementStep {
    id?: number;
    status: string;
    date: string;
    time: string;
    user: {
        name: string;
        avatar?: string;
        title: string;
        department?: string;
    };
    comments?: string;
    isCompleted: boolean;
    isRejected?: boolean;
    isCurrent?: boolean;
}


// Mock data for demonstration
const movementHistoryData: MovementStep[] = [
    {
        id: 1,
        status: 'Request Created',
        date: '14 Sep 2025',
        time: '09:11 AM',
        user: {
            name: 'Super Admin',
            title: 'Super Admin',
            department: 'IT Department'
        },
        comments: 'Requesting for a chair and computer to settle our interns.',
        isCompleted: true
    },
    {
        id: 2,
        status: 'Manager Approval',
        date: '15 Sep 2025',
        time: '11:30 AM',
        user: {
            name: 'Pride Pride',
            title: 'Department Manager',
            department: 'IT Department'
        },
        comments: 'Approved. This is a necessary request for the new interns.',
        isCompleted: true
    },
    {
        id: 3,
        status: 'Admin Acknowledgment',
        date: '15 Sep 2025',
        time: '02:15 PM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Acknowledged. Will proceed with processing this request.',
        isCompleted: true
    },
    {
        id: 4,
        status: 'Items Stocked',
        date: '16 Sep 2025',
        time: '10:45 AM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Items have been verified in stock and prepared for issuance.',
        isCompleted: true
    },
    {
        id: 5,
        status: 'Items Issued',
        date: '16 Sep 2025',
        time: '03:20 PM',
        user: {
            name: 'Jane Smith',
            title: 'Admin Officer',
            department: 'Administration'
        },
        comments: 'Items have been issued and are ready for collection.',
        isCompleted: true,
        isCurrent: true
    },
    {
        id: 6,
        status: 'Issuance Approved',
        date: 'Pending',
        time: '',
        user: {
            name: 'David Johnson',
            title: 'Admin Manager',
            department: 'Administration'
        },
        isCompleted: false
    },
    {
        id: 7,
        status: 'Items Received',
        date: 'Pending',
        time: '',
        user: {
            name: 'Super Admin',
            title: 'Super Admin',
            department: 'IT Department'
        },
        isCompleted: false
    }
];

const MovementHistory = ({ request }: { request: IRequest }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [requestReport, setRequestReport] = React.useState<IRequestReport | null>(null);
    const { acknowledgeRequest } = useContext(RequestContext);

    const findRequestReportByRequest = async (requestId: number) => {
        try {
            const response = await findRequestReportByRequestService(requestId) as IRequestReportAxiosResponse;
            if (response.data && response.data.id && response.status === 200) {
                setRequestReport(response.data);
                return response;
            }
            return null;
        } catch (error) {
            console.error("Error fetching request report:", error);
            return null;
        }
    }

    useEffect(() => {
        if (request && request.id) {
            findRequestReportByRequest(request.id as number)
        }
    }, [request]);

    // Find the current step
    const currentStep = movementHistoryData.find(step => step.isCurrent)?.id ||
        movementHistoryData.filter(step => step.isCompleted).length;

    console.log(acknowledgeRequest, "acknowledgeRequest from context");

    return (
        <Box>
            {/* Header section - more compact for tab content */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Box
                    sx={{
                        color: PRIMARY_COLOR,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        p: 0.5,
                        mr: 1.5,
                        width: 34,
                        height: 34
                    }}
                >
                    <HistoryIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Asset Request Workflow
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track approval, processing, and delivery status
                    </Typography>
                </Box>
            </Box>

            {/* Progress indicator - streamlined */}
            <Box
                sx={{
                    mb: 3,
                    px: { xs: 0, md: 1 },
                    py: 1,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    borderRadius: 1,
                    border: `1px solid ${alpha('#000', 0.06)}`
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Current Stage:
                            </Typography>
                            <Chip
                                label={
                                    movementHistoryData.find(step => step.isCurrent)?.status ||
                                    movementHistoryData[Math.min(currentStep - 1, movementHistoryData.length - 1)].status
                                }
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                    color: 'white'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Box sx={{ position: 'relative', height: 6, bgcolor: alpha(PRIMARY_COLOR, 0.1), borderRadius: 3 }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${(currentStep / movementHistoryData.length) * 100}%`,
                                    background: `linear-gradient(90deg, ${PRIMARY_COLOR} 0%, ${ACCENT_COLOR} 100%)`,
                                    borderRadius: 3,
                                    transition: 'width 1s ease-in-out'
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Start
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {Math.round((currentStep / movementHistoryData.length) * 100)}% Complete
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Custom Timeline implementation - centered alignment */}
            <Box sx={{ position: 'relative' }}>
                {/* Vertical line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 16, // Consistent left positioning for all screen sizes
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: `linear-gradient(to bottom, 
                            ${alpha(PRIMARY_COLOR, 0.7)}, 
                            ${alpha(PRIMARY_COLOR, 0.2)} 70%, 
                            ${alpha(PRIMARY_COLOR, 0.1)})`,
                        zIndex: 0
                    }}
                />


                {request && <MovementStage step={{
                    id: 1,
                    status: request.status?.name as string,
                    date: request.createDate ? new Date(request.createDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A',
                    time: request.createDate ? new Date(request.createDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '',
                    user: {
                        name: request.requester?.firstName + ' ' + request.requester?.lastName || '',
                        title: request.requester?.title?.name || '',
                        department: request.requester?.department?.name ? request.requester?.department?.name : request.requester?.branch?.name,
                    },
                    comments: request.description || '',
                    isCompleted: true
                }} />}

                {requestReport && <MovementStage step={{
                    status: "Manager Approval",
                    date: requestReport.createDate ? new Date(requestReport.createDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A',
                    time: requestReport.createDate ? new Date(requestReport.createDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '',
                    user: {
                        name: requestReport.approver?.firstName + ' ' + requestReport.approver?.lastName || '',
                        title: requestReport.approver?.title?.name || '',
                        department: requestReport.approver?.department?.name ? requestReport.approver?.department?.name : requestReport.approver?.branch?.name,
                    },
                    comments: requestReport.comment || '',
                    isCompleted: true
                }} />}

                {acknowledgeRequest && <MovementStage step={{
                    status: "Admin Acknowledgment",
                    date: acknowledgeRequest.createDate ? new Date(acknowledgeRequest.createDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A',
                    time: acknowledgeRequest.createDate ? new Date(acknowledgeRequest.createDate).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '',
                    user: {
                        name: acknowledgeRequest.user?.firstName + ' ' + acknowledgeRequest.user?.lastName || '',
                        title: acknowledgeRequest.user?.title?.name || '',
                        department: acknowledgeRequest.user?.department?.name ? acknowledgeRequest.user?.department?.name : acknowledgeRequest.user?.branch?.name,
                    },
                    comments: acknowledgeRequest.comment || '',
                    isCompleted: true
                }} />}
            </Box>

            <Box
                sx={{
                    textAlign: 'center',
                    mt: 2,
                    pt: 1.5,
                    pb: 0.5,
                    borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    This request was initiated on <b>14 Sep 2025</b> and is currently in the <b>Items Issued</b> stage.
                </Typography>
            </Box>

            {/* Add custom animation for the pulsing dot */}
            <Box
                sx={{
                    '@keyframes pulse': {
                        '0%': {
                            boxShadow: `0 0 0 0 ${alpha(PRIMARY_COLOR, 0.7)}`,
                        },
                        '70%': {
                            boxShadow: `0 0 0 6px ${alpha(PRIMARY_COLOR, 0)}`,
                        },
                        '100%': {
                            boxShadow: `0 0 0 0 ${alpha(PRIMARY_COLOR, 0)}`,
                        },
                    }
                }}
            />
        </Box>
    );
};

export default MovementHistory;