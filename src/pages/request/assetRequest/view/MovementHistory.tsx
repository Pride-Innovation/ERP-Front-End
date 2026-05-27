import React, { useContext, useEffect } from 'react';
import {
    Box,
    Typography,
    Chip,
    alpha,
} from '@mui/material';
import {
    History as HistoryIcon,
} from '@mui/icons-material';
import { IRequest, IRequestReport, IRequestReportAxiosResponse } from '../../interface';
import MovementStage from './MovementStage';
import { findRequestReportByRequestService } from '../service';
import { RequestContext } from '../../../../context/request/RequestContext';
import { brand } from '../../../../utils/tokens';

const PRIMARY_COLOR = '#08796C';
const ACCENT_COLOR = '#BC892C';

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

const MovementHistory = ({ request }: { request: IRequest }) => {
    const [requestReport, setRequestReport] = React.useState<IRequestReport | null>(null);
    const { acknowledgeRequest, currentIssuance, issuanceApproval, acknowledgeIssuance } = useContext(RequestContext);

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
    };

    useEffect(() => {
        if (request && request.id) {
            findRequestReportByRequest(request.id as number);
        }
    }, [request]);

    const progressPercent = acknowledgeIssuance ? 100
        : issuanceApproval ? 80
        : currentIssuance ? 60
        : acknowledgeRequest ? 40
        : request ? 20 : 0;

    const currentStageLabel = acknowledgeIssuance ? 'Items Received'
        : issuanceApproval ? 'Issuance Approved'
        : currentIssuance ? 'Items Issued'
        : acknowledgeRequest ? 'Admin Acknowledgment'
        : request ? 'Request Submitted' : 'Initiated';

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: alpha(brand[500], 0.1),
                        color: brand[600],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <HistoryIcon sx={{ fontSize: 17 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        Asset Request Workflow
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Track approval, processing, and delivery status
                    </Typography>
                </Box>
            </Box>

            {/* Progress strip */}
            <Box
                sx={{
                    mb: 3,
                    px: 2,
                    py: 1.5,
                    bgcolor: alpha(brand[50], 0.6),
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(brand[500], 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Current stage:
                    </Typography>
                    <Chip
                        label={currentStageLabel}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: brand[500],
                            color: '#fff',
                            height: 22,
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Box sx={{ position: 'relative', height: 6, bgcolor: alpha(PRIMARY_COLOR, 0.1), borderRadius: 3 }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: `${progressPercent}%`,
                                background: `linear-gradient(90deg, ${PRIMARY_COLOR} 0%, ${ACCENT_COLOR} 100%)`,
                                borderRadius: 3,
                                transition: 'width 0.8s ease-in-out',
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.67rem' }}>
                            Start
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.67rem' }}>
                            {Math.round(progressPercent)}% Complete
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Timeline */}
            <Box sx={{ position: 'relative' }}>
                {/* Vertical connector line */}
                <Box
                    sx={{
                        position: 'absolute',
                        left: 16,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: `linear-gradient(to bottom,
                            ${alpha(PRIMARY_COLOR, 0.65)},
                            ${alpha(PRIMARY_COLOR, 0.15)} 75%,
                            ${alpha(PRIMARY_COLOR, 0.05)})`,
                        zIndex: 0,
                    }}
                />

                {request && (
                    <MovementStage step={{
                        id: 1,
                        status: request.status?.name as string,
                        date: request.createDate
                            ? new Date(request.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: request.createDate
                            ? new Date(request.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (request.requester?.firstName ?? '') + ' ' + (request.requester?.lastName ?? ''),
                            title: request.requester?.title?.name || '',
                            department: request.requester?.department?.name || request.requester?.branch?.name,
                        },
                        comments: request.description || '',
                        isCompleted: true,
                    }} />
                )}

                {requestReport && (
                    <MovementStage step={{
                        status: 'Manager Approval',
                        date: requestReport.createDate
                            ? new Date(requestReport.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: requestReport.createDate
                            ? new Date(requestReport.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (requestReport.approver?.firstName ?? '') + ' ' + (requestReport.approver?.lastName ?? ''),
                            title: requestReport.approver?.title?.name || '',
                            department: requestReport.approver?.department?.name || requestReport.approver?.branch?.name,
                        },
                        comments: requestReport.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {acknowledgeRequest && (
                    <MovementStage step={{
                        status: 'Admin Acknowledgment',
                        date: acknowledgeRequest.createDate
                            ? new Date(acknowledgeRequest.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: acknowledgeRequest.createDate
                            ? new Date(acknowledgeRequest.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (acknowledgeRequest.user?.firstName ?? '') + ' ' + (acknowledgeRequest.user?.lastName ?? ''),
                            title: acknowledgeRequest.user?.title?.name || '',
                            department: acknowledgeRequest.user?.department?.name || acknowledgeRequest.user?.branch?.name,
                        },
                        comments: acknowledgeRequest.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {currentIssuance && (
                    <MovementStage step={{
                        status: 'Items Issued',
                        date: currentIssuance.createDate
                            ? new Date(currentIssuance.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: currentIssuance.createDate
                            ? new Date(currentIssuance.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (currentIssuance.issuer?.firstName ?? '') + ' ' + (currentIssuance.issuer?.lastName ?? ''),
                            title: currentIssuance.issuer?.title?.name || '',
                            department: currentIssuance.issuer?.department?.name || currentIssuance.issuer?.branch?.name,
                        },
                        comments: currentIssuance.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {issuanceApproval && (
                    <MovementStage step={{
                        status: 'Issuance Approved',
                        date: issuanceApproval.createDate
                            ? new Date(issuanceApproval.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: issuanceApproval.createDate
                            ? new Date(issuanceApproval.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (issuanceApproval.user?.firstName ?? '') + ' ' + (issuanceApproval.user?.lastName ?? ''),
                            title: issuanceApproval.user?.title?.name || '',
                            department: issuanceApproval.user?.department?.name || issuanceApproval.user?.branch?.name,
                        },
                        comments: issuanceApproval.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {acknowledgeIssuance && (
                    <MovementStage step={{
                        status: 'Items Received',
                        date: acknowledgeIssuance.createDate
                            ? new Date(acknowledgeIssuance.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A',
                        time: acknowledgeIssuance.createDate
                            ? new Date(acknowledgeIssuance.createDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                            : '',
                        user: {
                            name: (acknowledgeIssuance.user?.firstName ?? '') + ' ' + (acknowledgeIssuance.user?.lastName ?? ''),
                            title: acknowledgeIssuance.user?.title?.name || '',
                            department: acknowledgeIssuance.user?.department?.name || acknowledgeIssuance.user?.branch?.name,
                        },
                        comments: acknowledgeIssuance.comment || '',
                        isCompleted: true,
                    }} />
                )}
            </Box>

            {/* Footer note */}
            {request.createDate && (
                <Box
                    sx={{
                        mt: 2,
                        pt: 1.5,
                        borderTop: `1px dashed ${alpha(PRIMARY_COLOR, 0.15)}`,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" color="text.disabled">
                        Request initiated on{' '}
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {new Date(request.createDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Box>
                        {' · '}current stage:{' '}
                        <Box component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {currentStageLabel}
                        </Box>
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default MovementHistory;
