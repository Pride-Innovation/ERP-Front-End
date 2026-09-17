/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import {
    alpha,
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import DescriptionText from './DescriptionText';
import { fieldSx } from '../../../components/forms/Inputs';
import { ICommodity } from '../../settings/commodity/interface';
import { requestApproverLabel } from '../approverLabel';

/**
 * Shared presentation for the request-stage action modals (Acknowledge / Approve / Reject).
 * Hosted inside the app-wide ModalComponent, which already renders the modal title band —
 * so this layout deliberately has no header of its own: a compact request summary strip,
 * the requested items, the description, the action comment, and a footer.
 *
 * Section headers follow the PageSection idiom used on the create-movement page:
 * a small vertical accent bar + bold title over a hairline rule.
 *
 * Purely presentational: every action's data fetching, validation and submission stays in
 * its own component.
 */

/** The request fields this layout reads — structural subset of the request DTO. */
interface IRequestLite {
    id?: string | number;
    name?: string;
    description?: string | null;
    createDate?: unknown;
    requester?: { firstName?: string; lastName?: string } | null;
    currentApprover?: { firstName?: string; lastName?: string } | null;
    /**
     * The unit a group step is routed to.
     *
     * <p>Carried because an acknowledgement step names a unit and no individual, so without it the
     * modal's summary strip says the request is with nobody while asking you to act on it.
     */
    currentUnit?: { id?: string | number | null; name?: string } | null;
}

interface RequestActionLayoutProps {
    request: IRequestLite;
    /** Action accent — brand teal for positive actions, danger red for reject. */
    accent: string;
    /** Small icon rendered in the summary strip chip. */
    icon: ReactNode;
    /** Micro-kicker above the request name, e.g. "Request approval". */
    kicker: string;
    /** Label for the current-approver line, e.g. "You are approving as". Omit to hide. */
    actingLabel?: string;
    /**
     * Extra read-only key/value lines in the summary strip, alongside the requester —
     * e.g. issuance's "Issued" date / "By" issuer, for stages that aren't just a plain
     * request approval.
     */
    metaLines?: Array<{ label: string; value: string }>;
    /**
     * Callout shown above the content — 'error' for destructive stages (reject),
     * 'success'/'info' for confirmations (receipt acknowledgement).
     */
    banner?: { severity: 'error' | 'success' | 'info' | 'warning'; title: string; body: string };

    /** Requested items state. */
    loading: boolean;
    commodities: Array<{ commodity: ICommodity; quantity: number }>;
    /** Defaults to "Requested Items" — override for a stage-specific label (e.g. "Issued Items"). */
    itemsSectionTitle?: string;
    /** Optional labelled note shown under the description (e.g. the issuer's own comment). */
    additionalNote?: { label: string; body: string } | null;

    /** Comment field. */
    commentLabel: string;
    commentPlaceholder: string;
    commentHelper: string;
    comment: string;
    onCommentChange: (value: string) => void;

    /** Footer. */
    footerNote: string;
    buttonText: string;
    buttonIcon: ReactNode;
    sendingRequest: boolean;
    onSubmit: () => void;
    handleClose: () => void;
}

const formatDate = (value: unknown): string | null => {
    if (!value) return null;
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const personName = (person?: { firstName?: string; lastName?: string } | null): string | null => {
    if (!person) return null;
    const name = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
    return name || null;
};

/**
 * Section header — the create-movement page's idiom: vertical accent bar + bold title
 * over a hairline rule, with an optional right-side meta slot.
 */
const Section = ({
    accent,
    title,
    meta,
    children,
}: {
    accent: string;
    title: string;
    meta?: ReactNode;
    children: ReactNode;
}) => (
    <Box>
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ pb: 1, mb: 1.5, borderBottom: '1px solid #EEF2F7' }}
        >
            <Box sx={{ width: 3, height: 18, borderRadius: '2px', bgcolor: accent, flexShrink: 0 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', flex: 1, lineHeight: 1.3 }}>
                {title}
            </Typography>
            {meta}
        </Stack>
        {children}
    </Box>
);

const headCellSx = {
    fontWeight: 700,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748B',
    bgcolor: '#F8FAFC',
    borderBottom: '1px solid #E8EDF3',
    py: 1,
} as const;

const bodyCellSx = {
    borderBottom: '1px solid #F1F5F9',
    fontSize: '0.84rem',
    py: 1.1,
} as const;

const RequestActionLayout = ({
    request,
    accent,
    icon,
    kicker,
    actingLabel,
    metaLines,
    banner,
    loading,
    commodities,
    itemsSectionTitle = 'Requested Items',
    additionalNote,
    commentLabel,
    commentPlaceholder,
    commentHelper,
    comment,
    onCommentChange,
    footerNote,
    buttonText,
    buttonIcon,
    sendingRequest,
    onSubmit,
    handleClose,
}: RequestActionLayoutProps) => {
    const requesterName = personName(request.requester);
    // The unit when the step is routed to one; the modal is often opened *by* a member of that
    // unit, so naming it is more useful than an empty line.
    const approverName = requestApproverLabel(request);
    const submitted = formatDate(request.createDate);

    return (
        <Stack spacing={2.5}>
            {/* ── Request summary strip ── */}
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                    p: 1.75,
                    borderRadius: 2,
                    bgcolor: alpha(accent, 0.04),
                    border: `1px solid ${alpha(accent, 0.16)}`,
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                        bgcolor: alpha(accent, 0.1), color: accent,
                        border: `1px solid ${alpha(accent, 0.2)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        '& svg': { fontSize: 20 },
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
                            color: accent, fontSize: '0.62rem', display: 'block', lineHeight: 1.4,
                        }}
                    >
                        {kicker}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }} noWrap title={request.name}>
                        {request.name || 'Untitled request'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Request #{request.id ?? '—'}{submitted ? ` • Submitted ${submitted}` : ''}
                    </Typography>
                </Box>

                <Stack spacing={0.5} sx={{ flexShrink: 0, alignItems: 'flex-start' }}>
                    {requesterName && (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#BC892C' }}>
                                {requesterName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                Requester{' '}
                                <Box component="span" sx={{ color: '#1E293B', fontWeight: 700 }}>{requesterName}</Box>
                            </Typography>
                        </Stack>
                    )}
                    {actingLabel && approverName && (
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {actingLabel}{' '}
                            <Box component="span" sx={{ color: accent, fontWeight: 700 }}>{approverName}</Box>
                        </Typography>
                    )}
                    {metaLines?.map((line) => (
                        <Typography key={line.label} variant="caption" sx={{ color: '#64748B' }}>
                            {line.label}:{' '}
                            <Box component="span" sx={{ color: '#1E293B', fontWeight: 700 }}>{line.value}</Box>
                        </Typography>
                    ))}
                </Stack>
            </Stack>

            {/* ── Stage callout (reject warning / receipt confirmation) ── */}
            {banner && (
                <Alert
                    severity={banner.severity}
                    sx={{
                        borderRadius: 2,
                        '& .MuiAlert-message': { fontSize: '0.82rem' },
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{banner.title}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>{banner.body}</Typography>
                </Alert>
            )}

            {/* ── Requested items ── */}
            <Section
                accent={accent}
                title={itemsSectionTitle}
                meta={!loading ? (
                    <Chip
                        size="small"
                        label={`${commodities.length} item${commodities.length === 1 ? '' : 's'}`}
                        sx={{
                            height: 20, fontSize: '0.66rem', fontWeight: 700,
                            bgcolor: alpha(accent, 0.08), color: accent,
                            '& .MuiChip-label': { px: 1 },
                        }}
                    />
                ) : undefined}
            >
                {loading ? (
                    <Stack spacing={0.75}>
                        {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={34} />)}
                    </Stack>
                ) : commodities.length > 0 ? (
                    <Box sx={{ borderRadius: 2, border: '1px solid #E8EDF3', overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...headCellSx, width: 44, pl: 2 }}>#</TableCell>
                                    <TableCell sx={headCellSx}>Commodity</TableCell>
                                    <TableCell sx={headCellSx}>Unit of Measure</TableCell>
                                    <TableCell sx={headCellSx}>Category</TableCell>
                                    <TableCell sx={{ ...headCellSx, pr: 2 }} align="right">Quantity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {commodities.map((item, idx) => (
                                    <TableRow
                                        key={idx}
                                        hover
                                        sx={{ '&:last-child td': { borderBottom: 'none' } }}
                                    >
                                        <TableCell sx={{ ...bodyCellSx, pl: 2, color: '#94A3B8', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, fontWeight: 600, color: '#1E293B' }}>
                                            {item.commodity.name}
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, color: '#64748B' }}>
                                            {item.commodity.groupName || '—'}
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, color: '#64748B' }}>
                                            {item.commodity.assetType?.name || '—'}
                                        </TableCell>
                                        <TableCell sx={{ ...bodyCellSx, pr: 2 }} align="right">
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: 'inline-block', minWidth: 30, textAlign: 'center',
                                                    px: 1, py: 0.2, borderRadius: '6px',
                                                    fontWeight: 700, fontSize: '0.78rem',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    bgcolor: alpha(accent, 0.07), color: accent,
                                                }}
                                            >
                                                {item.quantity}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            py: 3, textAlign: 'center', borderRadius: 2,
                            border: '1px dashed #E2E8F0', bgcolor: '#FAFBFC',
                        }}
                    >
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            No items were found on this request.
                        </Typography>
                    </Box>
                )}
            </Section>

            {/* ── Description ── */}
            <Section accent={accent} title="Description">
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                        px: 2,
                        py: 1.75,
                        borderRadius: 2,
                        bgcolor: '#FAFBFC',
                        border: '1px solid #EEF2F7',
                    }}
                >
                    <Box
                        sx={{
                            width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                            bgcolor: '#fff', border: '1px solid #E8EDF3', color: '#94A3B8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <NotesOutlinedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            // DescriptionText ships a built-in top margin (mt={1.5}) that pushed the
                            // text off vertical centre inside this panel — reset it and normalise the
                            // type so the first line sits level with the icon chip.
                            '& .MuiTypography-root': {
                                m: 0,
                                fontSize: '0.85rem',
                                lineHeight: 1.7,
                                color: '#475569',
                            },
                        }}
                    >
                        <DescriptionText
                            description={(request.description as string) || 'No description provided.'}
                            MAX_LENGTH={400}
                        />
                        {additionalNote && (
                            <Box sx={{ mt: 1.25, pt: 1.25, borderTop: '1px dashed #E2E8F0' }}>
                                <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8', fontSize: '0.62rem' }}
                                >
                                    {additionalNote.label}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.25, color: '#475569', fontSize: '0.82rem', lineHeight: 1.6 }}>
                                    {additionalNote.body}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Section>

            {/* ── Comment ── */}
            <Section
                accent={accent}
                title={commentLabel}
                meta={
                    <Typography variant="caption" sx={{ color: accent, fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Required
                    </Typography>
                }
            >
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={commentPlaceholder}
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    // fieldSx pads the inner input for single-line height; a multiline root already
                    // carries its own padding, so zero the textarea's to avoid doubling up.
                    sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#94A3B8' }}>
                    {commentHelper}
                </Typography>
            </Section>

            {/* ── Footer ── */}
            <Divider sx={{ borderColor: '#EEF2F7' }} />
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ flexWrap: 'wrap', gap: 1.5 }}
            >
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {footerNote}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        disabled={sendingRequest}
                        sx={{
                            borderRadius: '8px', fontWeight: 600, textTransform: 'none', px: 2,
                            color: '#64748B', borderColor: '#E2E8F0',
                            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={sendingRequest}
                        startIcon={sendingRequest
                            ? <CircularProgress size={15} color="inherit" />
                            : buttonIcon}
                        sx={{
                            borderRadius: '8px', fontWeight: 600, textTransform: 'none', px: 2.25,
                            bgcolor: accent, boxShadow: 'none',
                            '&:hover': { bgcolor: accent, filter: 'brightness(0.92)', boxShadow: 'none' },
                        }}
                    >
                        {sendingRequest ? 'Processing…' : buttonText}
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default RequestActionLayout;
