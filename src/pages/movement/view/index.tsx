/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    alpha, Avatar, Box, Button, Chip, Grid,
    Paper, Stack, Typography, useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { toast } from 'react-toastify';
import { IMovement } from '../interface';
import { findMovementByIdService, downloadSecurityPassService } from '../service';
import { ROUTES } from '../../../core/routes/routes';
import Loading from '../../../components/loading';
import { statusConfig, MovementStatus } from '../mockMovements';

const PRIMARY = '#08796C';
const SECONDARY = '#BC892C';

// ── Detail row helper ─────────────────────────────────────────────────────────
const DetailRow = ({
    icon,
    label,
    value,
    chip,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
    chip?: React.ReactNode;
}) => (
    <Paper elevation={0} sx={{ p: 1.75, borderRadius: 2, border: `1px solid ${alpha('#000', 0.06)}`, mb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.25 }}>
                    {label}
                </Typography>
                {chip ?? (
                    <Typography variant="body2" sx={{ fontWeight: 500, color: value ? 'text.primary' : 'text.disabled', wordBreak: 'break-word' }}>
                        {value ?? 'Not specified'}
                    </Typography>
                )}
            </Box>
        </Stack>
    </Paper>
);

// ── Audit trail event ─────────────────────────────────────────────────────────
const AuditEvent = ({ action, actor, comment, date }: { action: string; actor?: string; comment?: string | null; date?: string | null }) => (
    <Stack direction="row" spacing={1.5} sx={{ pb: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PRIMARY, flexShrink: 0, mt: 0.5 }} />
            <Box sx={{ width: 1, flex: 1, bgcolor: alpha(PRIMARY, 0.15), mt: 0.5 }} />
        </Box>
        <Box sx={{ pb: 0.5, flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{action}</Typography>
            {actor && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>by {actor}</Typography>}
            {comment && <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block' }}>"{comment}"</Typography>}
            {date && <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', fontSize: '0.67rem' }}>{date}</Typography>}
        </Box>
    </Stack>
);

// ── Status chip helper ─────────────────────────────────────────────────────────
const StatusChip = ({ statusName }: { statusName?: string }) => {
    if (!statusName) return null;
    const key = statusName.toLowerCase().replace(' ', '_') as MovementStatus;
    const cfg = statusConfig[key];
    if (!cfg) return <Chip label={statusName} size="small" />;
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, '& .MuiChip-label': { px: 1.25 } }}
        />
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
const MovementDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();

    const [movement, setMovement] = useState<IMovement | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloadingPass, setDownloadingPass] = useState(false);

    const isEditable = movement?.status?.name === 'draft' || movement?.status?.name === 'rejected';

    const load = async () => {
        setLoading(true);
        try {
            const response = await findMovementByIdService(id as string) as any;
            if (response?.status === 200) {
                setMovement(response.data);
            } else {
                toast.error('Could not load movement details');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const handleDownloadPass = async () => {
        if (!movement?.id) return;
        setDownloadingPass(true);
        try {
            const response = await downloadSecurityPassService(movement.id) as any;
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-pass-${movement.referenceNo}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download security pass');
        } finally {
            setDownloadingPass(false);
        }
    };

    if (loading) return <Loading items="movement" />;

    if (!movement) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                <Typography variant="h6" color="text.secondary">Movement not found.</Typography>
                <Button onClick={() => navigate(ROUTES.MOVEMENT)} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                    Back to Movements
                </Button>
            </Box>
        );
    }

    const officerName = movement.requestingOfficer
        ? `${movement.requestingOfficer.firstName} ${movement.requestingOfficer.lastName}`
        : '—';

    const approverName = movement.approvedBy
        ? `${movement.approvedBy.firstName} ${movement.approvedBy.lastName}`
        : '—';

    return (
        <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%' }}>

            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(PRIMARY, 0.14)}`, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }} />
                <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                            <SwapHorizOutlinedIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                {movement.referenceNo ?? `Movement #${id}`}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                <StatusChip statusName={movement.status?.name} />
                                {movement.destinationType && (
                                    <Chip label={movement.destinationType} size="small" sx={{ height: 18, fontSize: '0.66rem', bgcolor: alpha(SECONDARY, 0.1), color: SECONDARY, fontWeight: 600 }} />
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.25} flexShrink={0}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(ROUTES.MOVEMENT)}
                            sx={{ borderRadius: 2, fontWeight: 600, fontSize: '0.78rem' }}
                        >
                            Back
                        </Button>
                        {isEditable && (
                            <Button
                                variant="contained"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => navigate(`${ROUTES.UPDATE_MOVEMENT}/${id}`)}
                                sx={{ borderRadius: 2, fontWeight: 600, bgcolor: PRIMARY, fontSize: '0.78rem', '&:hover': { bgcolor: theme.palette.primary.dark } }}
                            >
                                Edit
                            </Button>
                        )}
                        {movement.securityPassAvailable && (
                            <Button
                                variant="outlined"
                                startIcon={<DownloadOutlinedIcon />}
                                onClick={handleDownloadPass}
                                disabled={downloadingPass}
                                sx={{ borderRadius: 2, fontWeight: 600, borderColor: '#2563EB', color: '#2563EB', fontSize: '0.78rem', '&:hover': { borderColor: '#1D4ED8', bgcolor: alpha('#2563EB', 0.05) } }}
                            >
                                Security Pass
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Paper>

            <Grid container spacing={3} alignItems="flex-start">

                {/* ── Left column: details ─────────────────────────────────── */}
                <Grid item xs={12} md={7}>
                    <Stack spacing={2.5}>

                        {/* Movement info */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>
                                Movement Information
                            </Typography>
                            <DetailRow icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />} label="Requesting Officer" value={officerName} />
                            <DetailRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />} label="Destination" value={movement.destination} />
                            <DetailRow icon={<SwapHorizOutlinedIcon sx={{ fontSize: 16 }} />} label="Destination Type" value={movement.destinationType} />
                            <DetailRow icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />} label="Reason" value={movement.reason} />
                            <DetailRow
                                icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />}
                                label="Expected Return Date"
                                value={movement.expectedReturnDate
                                    ? new Date(movement.expectedReturnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : null}
                            />
                        </Paper>

                        {/* Rejection reason */}
                        {movement.rejectionComment && (
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#DC2626', 0.2)}`, bgcolor: alpha('#DC2626', 0.03) }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <InfoOutlinedIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#DC2626' }}>
                                        Rejection Reason
                                    </Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    "{movement.rejectionComment}"
                                </Typography>
                            </Paper>
                        )}

                        {/* Approval info */}
                        {movement.approvedBy && (
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>
                                    Approval Information
                                </Typography>
                                <DetailRow
                                    icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />}
                                    label="Approved By"
                                    value={approverName}
                                />
                                {movement.approvedDate && (
                                    <DetailRow
                                        icon={<EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />}
                                        label="Approval Date"
                                        value={new Date(movement.approvedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    />
                                )}
                            </Paper>
                        )}

                        {/* Release/receive info */}
                        {(movement.releasedBy || movement.receivedBy) && (
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: PRIMARY }}>
                                    Dispatch & Receipt
                                </Typography>
                                {movement.releasedBy && (
                                    <DetailRow
                                        icon={<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />}
                                        label="Released By"
                                        value={`${movement.releasedBy.firstName} ${movement.releasedBy.lastName}`}
                                    />
                                )}
                                {movement.releasedDate && (
                                    <DetailRow
                                        icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />}
                                        label="Release Date"
                                        value={new Date(movement.releasedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    />
                                )}
                                {movement.receivedBy && (
                                    <DetailRow
                                        icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />}
                                        label="Received By"
                                        value={`${movement.receivedBy.firstName} ${movement.receivedBy.lastName}`}
                                    />
                                )}
                            </Paper>
                        )}

                    </Stack>
                </Grid>

                {/* ── Right column: audit trail + assets ──────────────────── */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={2.5}>

                        {/* Audit trail */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: alpha(PRIMARY, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                                    <HistoryOutlinedIcon sx={{ fontSize: 15 }} />
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    Audit Trail
                                </Typography>
                            </Stack>

                            {movement.movementReports && movement.movementReports.length > 0 ? (
                                movement.movementReports.map((r, i) => (
                                    <AuditEvent
                                        key={r.id ?? i}
                                        action={r.action}
                                        actor={r.actor ? `${r.actor.firstName} ${r.actor.lastName}` : undefined}
                                        comment={r.comment}
                                        date={r.createDate ? new Date(r.createDate).toLocaleString('en-GB') : undefined}
                                    />
                                ))
                            ) : (
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                    No audit events yet.
                                </Typography>
                            )}
                        </Paper>

                        {/* Assets moved */}
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    Assets Moved
                                </Typography>
                                <Chip
                                    label={movement.movementAssets?.length ?? movement.assetsCount ?? 0}
                                    size="small"
                                    sx={{ height: 20, fontWeight: 700, bgcolor: alpha(SECONDARY, 0.1), color: SECONDARY }}
                                />
                            </Stack>

                            {movement.movementAssets && movement.movementAssets.length > 0 ? (
                                <Stack spacing={1}>
                                    {movement.movementAssets.map((ma, i) => (
                                        <Stack key={ma.id ?? i} direction="row" spacing={1.25} alignItems="center">
                                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY }}>
                                                {(ma.asset.assetName?.[0] ?? '?').toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                                    {ma.asset.assetName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.67rem' }}>
                                                    {ma.asset.engravedNumber}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                    No individual assets listed.
                                </Typography>
                            )}
                        </Paper>

                        {/* Meta */}
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha('#000', 0.07)}` }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
                                Record Metadata
                            </Typography>
                            <Stack spacing={0.75}>
                                {movement.createDate && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {new Date(movement.createDate).toLocaleString('en-GB')}
                                        </Typography>
                                    </Stack>
                                )}
                                {movement.lastModified && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last Modified</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {new Date(movement.lastModified).toLocaleString('en-GB')}
                                        </Typography>
                                    </Stack>
                                )}
                                {movement.createdBy && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created By</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {movement.createdBy.firstName} {movement.createdBy.lastName}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>

                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MovementDetails;
