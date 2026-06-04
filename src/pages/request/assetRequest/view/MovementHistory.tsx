import { useContext } from 'react';
import {
    Box,
    Typography,
    Chip,
    alpha,
} from '@mui/material';
import {
    History as HistoryIcon,
} from '@mui/icons-material';
import { IRequest, IRequestReport } from '../../interface';
import MovementStage from './MovementStage';
import { RequestContext } from '../../../../context/request/RequestContext';
import { brand } from '../../../../utils/tokens';

const PRIMARY_COLOR = '#08796C';
const REJECT_COLOR = '#DC2626';

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

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
const fmtTime = (d?: string | null) =>
    d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
const fullName = (u?: { firstName?: string; lastName?: string } | null) =>
    `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();

const isRejection = (report: IRequestReport) =>
    (report.status?.status ?? '').toLowerCase().includes('reject');

/** Human label for an approval-history entry, derived from its status code. */
const reportLabel = (report: IRequestReport): string => {
    const code = (report.status?.status ?? '').toLowerCase();
    if (code.includes('reject')) return 'Request Rejected';
    // A fresh "requestCreated" record after the first one is a resubmission by the requester.
    if (code === 'requestcreated') return 'Request Resubmitted';
    return report.status?.name || 'Approved';
};

const MovementHistory = ({ request }: { request: IRequest }) => {
    const { acknowledgeRequest, currentIssuance, issuanceApproval, acknowledgeIssuance } = useContext(RequestContext);

    // The full, append-only approval trail comes back on the request itself — every
    // approval, rejection and resubmission is its own persisted record.
    const reports = [...(request.requestReports ?? [])].sort(
        (a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
    );

    // Header/progress reflect the request's *current* state; individual rejections
    // are still rendered in the trail below regardless of where the request is now.
    const requestIsRejected = (request.status?.status ?? '').toLowerCase() === 'requestrejected';

    const progressPercent = requestIsRejected ? 100
        : acknowledgeIssuance?.createDate ? 100
        : issuanceApproval?.createDate ? 80
        : currentIssuance?.createDate ? 60
        : acknowledgeRequest?.createDate ? 40
        : request ? 20 : 0;

    const currentStageLabel = requestIsRejected ? 'Request Rejected'
        : acknowledgeIssuance?.createDate ? 'Items Received'
        : issuanceApproval?.createDate ? 'Issuance Approved'
        : currentIssuance?.createDate ? 'Items Issued'
        : acknowledgeRequest?.createDate ? 'Admin Acknowledgment'
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
                        Approval History
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Track approvals, processing and delivery
                    </Typography>
                </Box>
            </Box>

            {/* Progress strip */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                        Current stage:
                    </Typography>
                    <Chip
                        label={currentStageLabel}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor: requestIsRejected ? REJECT_COLOR : brand[500],
                            color: '#fff',
                            height: 22,
                        }}
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Box sx={{ position: 'relative', height: 5, bgcolor: alpha('#000', 0.06), borderRadius: 3 }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: `${progressPercent}%`,
                                bgcolor: requestIsRejected ? REJECT_COLOR : PRIMARY_COLOR,
                                borderRadius: 3,
                                transition: 'width 0.6s ease',
                            }}
                        />
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
                        top: 4,
                        bottom: 16,
                        width: 2,
                        bgcolor: alpha('#000', 0.06),
                        zIndex: 0,
                    }}
                />

                {/* Original submission */}
                {request && (
                    <MovementStage step={{
                        id: 0,
                        status: 'Request Submitted',
                        date: fmtDate(request.createDate),
                        time: fmtTime(request.createDate),
                        user: {
                            name: fullName(request.requester),
                            title: request.requester?.title?.name || '',
                            department: request.requester?.department?.name || request.requester?.branch?.name,
                        },
                        comments: request.description || '',
                        isCompleted: true,
                    }} />
                )}

                {/* Every approval, rejection and resubmission — append-only */}
                {reports.map((report) => (
                    <MovementStage key={report.id} step={{
                        status: reportLabel(report),
                        date: fmtDate(report.createDate),
                        time: fmtTime(report.createDate),
                        user: {
                            name: fullName(report.approver),
                            title: report.approver?.title?.name || '',
                            department: report.approver?.department?.name || report.approver?.branch?.name,
                        },
                        comments: report.comment || '',
                        isCompleted: true,
                        isRejected: isRejection(report),
                    }} />
                ))}

                {acknowledgeRequest?.createDate && (
                    <MovementStage step={{
                        status: 'Admin Acknowledgment',
                        date: fmtDate(acknowledgeRequest.createDate),
                        time: fmtTime(acknowledgeRequest.createDate),
                        user: {
                            name: fullName(acknowledgeRequest.user),
                            title: acknowledgeRequest.user?.title?.name || '',
                            department: acknowledgeRequest.user?.department?.name || acknowledgeRequest.user?.branch?.name,
                        },
                        comments: acknowledgeRequest.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {currentIssuance?.createDate && (
                    <MovementStage step={{
                        status: 'Items Issued',
                        date: fmtDate(currentIssuance.createDate),
                        time: fmtTime(currentIssuance.createDate),
                        user: {
                            name: fullName(currentIssuance.issuer),
                            title: currentIssuance.issuer?.title?.name || '',
                            department: currentIssuance.issuer?.department?.name || currentIssuance.issuer?.branch?.name,
                        },
                        comments: currentIssuance.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {issuanceApproval?.createDate && (
                    <MovementStage step={{
                        status: 'Issuance Approved',
                        date: fmtDate(issuanceApproval.createDate),
                        time: fmtTime(issuanceApproval.createDate),
                        user: {
                            name: fullName(issuanceApproval.user),
                            title: issuanceApproval.user?.title?.name || '',
                            department: issuanceApproval.user?.department?.name || issuanceApproval.user?.branch?.name,
                        },
                        comments: issuanceApproval.comment || '',
                        isCompleted: true,
                    }} />
                )}

                {acknowledgeIssuance?.createDate && (
                    <MovementStage step={{
                        status: 'Items Received',
                        date: fmtDate(acknowledgeIssuance.createDate),
                        time: fmtTime(acknowledgeIssuance.createDate),
                        user: {
                            name: fullName(acknowledgeIssuance.user),
                            title: acknowledgeIssuance.user?.title?.name || '',
                            department: acknowledgeIssuance.user?.department?.name || acknowledgeIssuance.user?.branch?.name,
                        },
                        comments: acknowledgeIssuance.comment || '',
                        isCompleted: true,
                    }} />
                )}
            </Box>
        </Box>
    );
};

export default MovementHistory;
