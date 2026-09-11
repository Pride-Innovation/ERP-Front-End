import React from 'react';
import {
    Box,
    Typography,
    Paper,
    alpha,
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
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { brand, border } from '../../../../utils/tokens';
import { requestApproverLabel } from '../../approverLabel';

const TEAL = '#08796C';

// ── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Box
            sx={{
                width: 26,
                height: 26,
                borderRadius: '7px',
                bgcolor: alpha(brand[500], 0.1),
                color: brand[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '& svg': { fontSize: 15 },
            }}
        >
            {icon}
        </Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '0.7rem' }}>
            {title}
        </Typography>
    </Box>
);

// ── Info row — icon + label + value ────────────────────────────────────────
const InfoRow = ({
    icon,
    label,
    value,
    secondary,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    secondary?: string;
    highlight?: boolean;
}) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            py: 1.1,
            borderBottom: `1px solid ${alpha('#000', 0.05)}`,
            '&:last-child': { borderBottom: 'none' },
        }}
    >
        <Box sx={{ color: highlight ? TEAL : 'text.disabled', mt: 0.15, flexShrink: 0, '& svg': { fontSize: 16 } }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1.2, mb: 0.25, fontSize: '0.68rem' }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={highlight ? 600 : 400} color={highlight ? 'text.primary' : 'text.primary'} sx={{ lineHeight: 1.4 }}>
                {value}
            </Typography>
            {secondary && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {secondary}
                </Typography>
            )}
        </Box>
    </Box>
);

// ── Card wrapper ────────────────────────────────────────────────────────────
const InfoCard = ({ children, mt = 0 }: { children: React.ReactNode; mt?: number }) => (
    <Paper
        elevation={0}
        sx={{
            border: `1px solid ${border.subtle}`,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#fff',
            mt,
        }}
    >
        {children}
    </Paper>
);

const CardContent = ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
    <>
        <Box sx={{ px: 2, pt: 2, pb: 1.5, bgcolor: alpha(brand[500], 0.025), borderBottom: `1px solid ${alpha(brand[500], 0.07)}` }}>
            {header}
        </Box>
        <Box sx={{ px: 2, py: 0.5 }}>
            {children}
        </Box>
    </>
);

const getTimestamp = (dateString?: string | Date) =>
    dateString ? moment(dateString).format('MMM DD, YYYY · h:mm A') : undefined;

const OtherDetails = ({
    request,
    acknowledgeIssuance,
    acknowledgeRequest,
    issuanceApproval,
    issuance
}: {
    request: IRequest;
    acknowledgeIssuance?: IAcknowledgeIssuanceReceipt;
    acknowledgeRequest?: IAcknowledgeIssuanceReceipt;
    issuanceApproval?: IAcknowledgeIssuanceReceipt;
    issuance?: IIssue;
}) => {
    const hasProcessingDetails =
        acknowledgeRequest?.user ||
        issuance?.issuer ||
        issuanceApproval?.user ||
        acknowledgeIssuance?.user;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Request Initiation */}
            <InfoCard>
                <CardContent
                    header={<SectionHeader title="Request Initiation" icon={<AssignmentTurnedInIcon />} />}
                >
                    {request.requester && (
                        <InfoRow
                            icon={<AccountCircleOutlinedIcon />}
                            label="Requested By"
                            value={`${request.requester.firstName} ${request.requester.lastName}`}
                            secondary={getTimestamp(request.createDate as string)}
                            highlight
                        />
                    )}

                    {/*
                      * Rendered for a unit-routed step too, which used to disappear entirely: the row
                      * was conditional on `currentApprover`, so a request with Admin simply had no
                      * "Current Approver" line at all and the reader could not tell whether that meant
                      * nobody or nobody-had-checked.
                      *
                      * The secondary line stays a person's posting; a unit has no title or department
                      * to qualify it with, and inventing one would be worse than leaving it blank.
                      */}
                    {requestApproverLabel(request) && (
                        <InfoRow
                            icon={<SupervisedUserCircleOutlinedIcon />}
                            label="Current Approver"
                            value={requestApproverLabel(request) as string}
                            secondary={request.currentApprover ? [
                                request.currentApprover.title?.name,
                                request.currentApprover.department?.name,
                                request.currentApprover.branch?.name,
                            ].filter(Boolean).join(' · ') : undefined}
                        />
                    )}

                    {request.currentApprover?.branch?.name && (
                        <InfoRow
                            icon={<LocationOnOutlinedIcon />}
                            label="Approver Branch"
                            value={request.currentApprover.branch.name}
                        />
                    )}

                    {!request.requester && !request.currentApprover && (
                        <Typography variant="body2" color="text.disabled" sx={{ py: 1.5, fontStyle: 'italic', fontSize: '0.82rem' }}>
                            No initiation details available
                        </Typography>
                    )}
                </CardContent>
            </InfoCard>

            {/* Processing Timeline */}
            {hasProcessingDetails && (
                <InfoCard>
                    <CardContent
                        header={<SectionHeader title="Processing Timeline" icon={<AccountTreeOutlinedIcon />} />}
                    >
                        {acknowledgeRequest?.user && (
                            <InfoRow
                                icon={<AddchartIcon />}
                                label="Request Acknowledged"
                                value={`${acknowledgeRequest.user.firstName} ${acknowledgeRequest.user.lastName}`}
                                secondary={getTimestamp(acknowledgeRequest.createDate as string)}
                                highlight
                            />
                        )}

                        {issuance?.issuer && (
                            <InfoRow
                                icon={<InputOutlinedIcon />}
                                label="Items Issued"
                                value={`${issuance.issuer.firstName} ${issuance.issuer.lastName}`}
                                secondary={getTimestamp(issuance.createDate)}
                                highlight
                            />
                        )}

                        {issuanceApproval?.user && (
                            <InfoRow
                                icon={<ThumbUpOffAltIcon />}
                                label="Issuance Approved"
                                value={`${issuanceApproval.user.firstName} ${issuanceApproval.user.lastName}`}
                                secondary={getTimestamp(issuanceApproval.createDate as string)}
                                highlight
                            />
                        )}

                        {acknowledgeIssuance?.user && (
                            <InfoRow
                                icon={<HdrAutoOutlinedIcon />}
                                label="Issuance Acknowledged"
                                value={`${acknowledgeIssuance.user.firstName} ${acknowledgeIssuance.user.lastName}`}
                                secondary={getTimestamp(acknowledgeIssuance.createDate as string)}
                                highlight
                            />
                        )}
                    </CardContent>
                </InfoCard>
            )}

            {/* Timestamps */}
            <InfoCard>
                <CardContent
                    header={<SectionHeader title="Timestamps" icon={<AccessTimeOutlinedIcon />} />}
                >
                    {request.createDate && (
                        <InfoRow
                            icon={<TodayOutlinedIcon />}
                            label="Created"
                            value={moment(request.createDate).format('MMMM DD, YYYY')}
                            secondary={moment(request.createDate).format('h:mm A')}
                        />
                    )}

                    {request.lastModified && (
                        <InfoRow
                            icon={<EventAvailableOutlinedIcon />}
                            label="Last Updated"
                            value={moment(request.lastModified).format('MMMM DD, YYYY')}
                            secondary={moment(request.lastModified).format('h:mm A')}
                        />
                    )}

                    {!request.createDate && !request.lastModified && (
                        <Typography variant="body2" color="text.disabled" sx={{ py: 1.5, fontStyle: 'italic', fontSize: '0.82rem' }}>
                            No timestamp data available
                        </Typography>
                    )}
                </CardContent>
            </InfoCard>

            {/* Empty state */}
            {!request.requester && !hasProcessingDetails && !request.createDate && (
                <Box
                    sx={{
                        py: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.disabled',
                    }}
                >
                    <AssignmentTurnedInIcon sx={{ fontSize: 36 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        No processing details available
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default OtherDetails;
