import {
    Box,
    Typography,
    Paper,
    alpha,
    Divider,
    Chip,
    Stack
} from "@mui/material";
import { IRequest } from "../../interface";
import { IAcknowledgeIssuanceReceipt, IIssue } from "../issue/interface";
import moment from "moment";

// Icons
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import AddchartIcon from '@mui/icons-material/Addchart';
import InputOutlinedIcon from '@mui/icons-material/InputOutlined';
import HdrAutoOutlinedIcon from '@mui/icons-material/HdrAutoOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Enhanced version of DetailSection
const EnhancedDetailSection = ({
    label,
    text,
    icon,
    timestamp,
    status = "completed"
}: {
    label: string;
    text: string;
    icon: JSX.Element;
    timestamp?: string;
    status?: "pending" | "completed" | "active";
}) => {

    // Define colors based on status
    const getStatusStyles = () => {
        switch (status) {
            case "pending":
                return {
                    iconColor: "text.disabled",
                    iconBg: alpha('#000', 0.05),
                    borderColor: alpha('#000', 0.08)
                };
            case "active":
                return {
                    iconColor: PRIMARY_COLOR,
                    iconBg: alpha(PRIMARY_COLOR, 0.12),
                    borderColor: alpha(PRIMARY_COLOR, 0.3)
                };
            case "completed":
            default:
                return {
                    iconColor: SECONDARY_COLOR,
                    iconBg: alpha(SECONDARY_COLOR, 0.12),
                    borderColor: alpha(SECONDARY_COLOR, 0.3)
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 1.5,
                border: `1px solid ${styles.borderColor}`,
                bgcolor: alpha('#fff', 0.7),
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: `0 3px 10px ${alpha('#000', 0.08)}`,
                }
            }}
        >
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                    sx={{
                        bgcolor: styles.iconBg,
                        color: styles.iconColor,
                        borderRadius: 1,
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                            {label}
                        </Typography>

                        {status === "pending" ? (
                            <Chip
                                label="Pending"
                                size="small"
                                sx={{
                                    fontSize: '0.75rem',
                                    bgcolor: alpha('#9e9e9e', 0.1),
                                    color: '#757575',
                                    fontWeight: 500
                                }}
                            />
                        ) : null}
                    </Box>

                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                        {text}
                    </Typography>

                    {timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <HistoryIcon fontSize="inherit" />
                            {timestamp}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};

// Section header component
const SectionHeader = ({ title, icon }: { title: string, icon: JSX.Element }) => (
    <Box sx={{ mb: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
                sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                    color: PRIMARY_COLOR,
                    borderRadius: 1,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </Box>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                {title}
            </Typography>
        </Box>
        <Divider sx={{ mt: 1.5 }} />
    </Box>
);

const OtherDetails = ({
    request,
    acknowledgeIssuance,
    acknowledgeRequest,
    issuanceApproval,
    issuance
}: {
    request: IRequest
} & {
    acknowledgeIssuance?: IAcknowledgeIssuanceReceipt,
    acknowledgeRequest?: IAcknowledgeIssuanceReceipt,
    issuanceApproval?: IAcknowledgeIssuanceReceipt,
    issuance?: IIssue
}) => {
    // Determine if we have any processing details
    const hasProcessingDetails = acknowledgeRequest?.user || issuance?.issuer ||
        issuanceApproval?.user || acknowledgeIssuance?.user;

    // Get formatted timestamps if available
    const getTimestamp = (dateString?: string | Date) => {
        return dateString ? moment(dateString).format('MMM DD, YYYY - h:mm A') : undefined;
    };

    return (
        <Box sx={{ px: 1 }}>
            {/* Request Initiation Section */}
            <SectionHeader title="Request Initiation" icon={<AssignmentTurnedInIcon fontSize="small" />} />

            {request.requester && (
                <EnhancedDetailSection
                    label="Requested By"
                    icon={<AccountCircleOutlinedIcon />}
                    text={`${request.requester.firstName} ${request.requester.lastName}`}
                    timestamp={getTimestamp(request.createDate as string)}
                    status="completed"
                />
            )}

            {request.currentApprover && (
                <EnhancedDetailSection
                    label="Current Approver"
                    icon={<SupervisedUserCircleOutlinedIcon />}
                    text={`${request.currentApprover.firstName} ${request.currentApprover.lastName}`}
                    status={acknowledgeRequest?.user ? "active" : "pending"}
                />
            )}

            {/* Processing Timeline Section */}
            {hasProcessingDetails && (
                <>
                    <SectionHeader title="Processing Timeline" icon={<TodayOutlinedIcon fontSize="small" />} />

                    {acknowledgeRequest?.user && (
                        <EnhancedDetailSection
                            label="Request Acknowledged"
                            icon={<AddchartIcon />}
                            text={`${acknowledgeRequest.user.firstName} ${acknowledgeRequest.user.lastName}`}
                            timestamp={getTimestamp(acknowledgeRequest.createDate as string)}
                            status="completed"
                        />
                    )}

                    {issuance?.issuer && (
                        <EnhancedDetailSection
                            label="Items Issued"
                            icon={<InputOutlinedIcon />}
                            text={`${issuance.issuer.firstName} ${issuance.issuer.lastName}`}
                            timestamp={getTimestamp(issuance.createDate)}
                            status="completed"
                        />
                    )}

                    {issuanceApproval?.user && (
                        <EnhancedDetailSection
                            label="Issuance Approved"
                            icon={<ThumbUpOffAltIcon />}
                            text={`${issuanceApproval.user.firstName} ${issuanceApproval.user.lastName}`}
                            timestamp={getTimestamp(issuanceApproval.createDate as string)}
                            status="completed"
                        />
                    )}

                    {acknowledgeIssuance?.user && (
                        <EnhancedDetailSection
                            label="Issuance Acknowledged"
                            icon={<HdrAutoOutlinedIcon />}
                            text={`${acknowledgeIssuance.user.firstName} ${acknowledgeIssuance.user.lastName}`}
                            timestamp={getTimestamp(acknowledgeIssuance.createDate as string)}
                            status="completed"
                        />
                    )}
                </>
            )}

            {/* Timestamps Section */}
            <SectionHeader title="Timestamps" icon={<EventAvailableOutlinedIcon fontSize="small" />} />

            {request.createDate && (
                <EnhancedDetailSection
                    label="Creation Date"
                    icon={<TodayOutlinedIcon />}
                    text={moment(request.createDate).format('MMMM DD, YYYY - h:mm A')}
                    status="completed"
                />
            )}

            {request.lastModified && (
                <EnhancedDetailSection
                    label="Last Updated"
                    icon={<EventAvailableOutlinedIcon />}
                    text={moment(request.lastModified).format('MMMM DD, YYYY - h:mm A')}
                    status="completed"
                />
            )}

            {/* Empty State */}
            {!request.requester && !hasProcessingDetails && !request.createDate && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `1px dashed ${alpha('#000', 0.15)}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        my: 3
                    }}
                >
                    <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic' }}>
                        No processing details available for this request
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default OtherDetails;