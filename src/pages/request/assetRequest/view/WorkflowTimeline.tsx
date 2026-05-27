import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import moment from 'moment';
import { brand } from '../../../../utils/tokens';

const TEAL = brand[800];
const GOLD = '#BC892C';
const BASE_URL = process.env.REACT_APP_BASE_URL;

interface StepLog {
    id: number;
    stepOrder: number;
    stepName: string;
    action: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'ACKNOWLEDGED';
    comment: string | null;
    actorId: number | null;
    actorName: string | null;
    actorEmail: string | null;
    createDate: string;
    lastModified: string;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    APPROVED: { label: 'Approved', color: '#276749', bgColor: '#F0FFF4', icon: <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem', color: '#276749' }} /> },
    REJECTED: { label: 'Rejected', color: '#C53030', bgColor: '#FFF5F5', icon: <CancelOutlinedIcon sx={{ fontSize: '1.1rem', color: '#C53030' }} /> },
    PENDING: { label: 'Pending', color: GOLD, bgColor: '#FFFBEA', icon: <HourglassEmptyIcon sx={{ fontSize: '1.1rem', color: GOLD }} /> },
    ISSUED: { label: 'Issued', color: TEAL, bgColor: alpha(TEAL, 0.06), icon: <LocalShippingOutlinedIcon sx={{ fontSize: '1.1rem', color: TEAL }} /> },
    ACKNOWLEDGED: { label: 'Acknowledged', color: TEAL, bgColor: alpha(TEAL, 0.06), icon: <FactCheckOutlinedIcon sx={{ fontSize: '1.1rem', color: TEAL }} /> },
};

interface Props {
    requestId: number;
}

const WorkflowTimeline: React.FC<Props> = ({ requestId }) => {
    const [logs, setLogs] = useState<StepLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!requestId) return;
        setLoading(true);
        axios
            .get<StepLog[]>(`${BASE_URL}/workflow/step-logs/${requestId}`)
            .then((res) => setLogs(res.data))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, [requestId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={28} sx={{ color: TEAL }} />
            </Box>
        );
    }

    if (logs.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No approval history available for this request.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 1 }}>
            {logs.map((log, index) => {
                const config = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.PENDING;
                const isLast = index === logs.length - 1;

                return (
                    <Box key={log.id} sx={{ display: 'flex', gap: 2, mb: isLast ? 0 : 2 }}>
                        {/* Left: step connector */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: '50%',
                                bgcolor: config.bgColor,
                                border: `2px solid ${config.color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {config.icon}
                            </Box>
                            {!isLast && (
                                <Box sx={{ width: 2, flex: 1, bgcolor: alpha(TEAL, 0.15), mt: 0.5, minHeight: 24 }} />
                            )}
                        </Box>

                        {/* Right: content card */}
                        <Paper
                            variant="outlined"
                            sx={{
                                flex: 1, p: 1.5,
                                borderRadius: 2,
                                borderColor: alpha(config.color, 0.22),
                                bgcolor: log.action === 'PENDING' ? alpha(GOLD, 0.025) : '#fff',
                                transition: 'box-shadow 0.15s',
                                '&:hover': { boxShadow: `0 2px 8px ${alpha(config.color, 0.1)}` },
                            }}
                        >
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} flexWrap="wrap">
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                        Step {log.stepOrder}: {log.stepName}
                                    </Typography>
                                    {log.actorName ? (
                                        <Typography variant="caption" color="text.secondary">
                                            {log.actorName}
                                            {log.actorEmail ? ` · ${log.actorEmail}` : ''}
                                        </Typography>
                                    ) : log.actorEmail ? (
                                        <Typography variant="caption" color="text.secondary">{log.actorEmail}</Typography>
                                    ) : null}
                                </Box>
                                <Chip
                                    label={config.label}
                                    size="small"
                                    sx={{
                                        bgcolor: config.bgColor,
                                        color: config.color,
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        border: `1px solid ${alpha(config.color, 0.3)}`,
                                    }}
                                />
                            </Stack>

                            {log.comment && (
                                <>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        "{log.comment}"
                                    </Typography>
                                </>
                            )}

                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                                {log.action === 'PENDING'
                                    ? `Sent ${moment(log.createDate).fromNow()}`
                                    : moment(log.lastModified).format('DD MMM YYYY, h:mm A')}
                            </Typography>
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
};

export default WorkflowTimeline;
