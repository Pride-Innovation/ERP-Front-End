/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { toast } from 'react-toastify';

import { IInventory, IStockCommodities, IStockReceipt } from '../interface';
import { closeShortService, fetchStockReceiptsService, receiveDeliveryService } from '../service';
import { brand, neutral, border, surface, elevation, radii, status as statusTokens } from '../../../utils/tokens';
// The dialog's inputs deliberately reuse the shared field styling and money formatting used by the
// Create Inventory form and the Stock Items table, so a receipt doesn't look like a different app.
import { fieldSx } from '../../../components/forms/Inputs';
import { formatNumberWithCommas } from '../../../components/stockForm/helper';

const PRIMARY = brand[500];

interface Props {
    inventory: IInventory;
    onDeliveryReceived?: () => void;
}

/**
 * Per-commodity delivery status for a single Stock, plus the history of physical receipts against
 * it.
 *
 * <p>Receiving is deliberately <b>batch-shaped</b>, not row-shaped: a supplier delivers a van-load
 * covering several commodities against one delivery note, and that is one goods-receipt producing
 * one GRN. Receiving each row separately produced a separate GRN per commodity for what was
 * physically a single delivery, which is not what a GRN is.
 */
const DeliveryStatusPanel = ({ inventory, onDeliveryReceived }: Props) => {
    const theme = useTheme();
    const commodities = inventory.commodities ?? [];
    const [searchParams, setSearchParams] = useSearchParams();

    const [receiveOpen, setReceiveOpen] = useState(false);
    const [closeShortOpen, setCloseShortOpen] = useState(false);
    const [receipts, setReceipts] = useState<IStockReceipt[]>([]);
    const isClosedShort = (inventory.status?.status ?? '').toLowerCase() === 'stockclosedshort';

    const loadReceipts = async () => {
        if (!inventory.id) return;
        try {
            const response = await fetchStockReceiptsService(inventory.id);
            setReceipts((response.data as IStockReceipt[]) ?? []);
        } catch {
            // The history is supplementary; a failure here must not blank out the status table.
            setReceipts([]);
        }
    };

    useEffect(() => {
        loadReceipts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory.id, inventory.commodities]);

    // Arriving from the list's "Receive Delivery" action opens the dialog straight away, then the
    // parameter is dropped so a refresh doesn't reopen it.
    useEffect(() => {
        if (searchParams.get('action') === 'receive' && commodities.length > 0) {
            setReceiveOpen(true);
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, commodities.length]);

    if (commodities.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">No commodities found in this inventory.</Alert>
            </Box>
        );
    }

    const totalOrdered = commodities.reduce((sum, c) => sum + (c.orderedQuantity || 0), 0);
    const totalDelivered = commodities.reduce((sum, c) => sum + (c.deliveredQuantity || 0), 0);
    const totalOutstanding = totalOrdered - totalDelivered;
    const fullyDelivered = totalOutstanding === 0;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header summary */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 2 }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
            >
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingOutlinedIcon sx={{ color: PRIMARY }} />
                        Delivery Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Ordered vs delivered per commodity. Record each physical delivery as it arrives.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <SummaryStat label="Ordered" value={totalOrdered} color={theme.palette.text.primary} />
                    <SummaryStat label="Delivered" value={totalDelivered} color={PRIMARY} />
                    <SummaryStat
                        label="Outstanding"
                        value={totalOutstanding}
                        color={totalOutstanding > 0 ? '#C0392B' : theme.palette.text.disabled}
                    />
                </Stack>
            </Stack>

            {fullyDelivered && (
                <Alert
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    severity="success"
                    sx={{ mb: 2 }}
                >
                    Every commodity in this delivery is now fully received. The GRN can be generated, signed by the supplier, and uploaded.
                </Alert>
            )}

            {isClosedShort && (
                <Alert icon={<BlockOutlinedIcon fontSize="small" />} severity="info" sx={{ mb: 2 }}>
                    This delivery was closed short — the outstanding balance is not expected.
                    {inventory.closeShortReason ? ` Reason: ${inventory.closeShortReason}` : ''}
                </Alert>
            )}

            {!fullyDelivered && (
                <Alert
                    severity={isClosedShort ? 'info' : 'warning'}
                    sx={{ mb: 2 }}
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
                                onClick={() => setReceiveOpen(true)}
                                sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}
                            >
                                Receive Delivery
                            </Button>
                            {!isClosedShort && (
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={<BlockOutlinedIcon fontSize="small" />}
                                    onClick={() => setCloseShortOpen(true)}
                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                    Close short
                                </Button>
                            )}
                        </Stack>
                    }
                >
                    {totalOutstanding.toLocaleString()} unit{totalOutstanding === 1 ? '' : 's'} still outstanding.
                </Alert>
            )}

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.4)}`, borderRadius: 2 }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(PRIMARY, 0.04) }}>
                            <TableCell sx={{ fontWeight: 700 }}>Commodity</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Ordered</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Delivered</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Outstanding</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 240 }}>Progress</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {commodities.map((c, idx) => {
                            const ordered = c.orderedQuantity || 0;
                            const delivered = c.deliveredQuantity || 0;
                            const outstanding = Math.max(ordered - delivered, 0);
                            const pct = ordered === 0 ? 0 : Math.min((delivered / ordered) * 100, 100);
                            const complete = outstanding === 0;

                            return (
                                <TableRow key={`${c.commodity?.id ?? idx}-${idx}`} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                            {c.commodity?.name ?? '—'}
                                        </Typography>
                                        {c.commodity?.groupName && (
                                            <Typography variant="caption" color="text.secondary">
                                                {c.commodity.groupName}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>{ordered}</TableCell>
                                    <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: PRIMARY }}>
                                        {delivered}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Chip
                                            label={outstanding}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                bgcolor: outstanding > 0 ? alpha('#ef4444', 0.08) : alpha(PRIMARY, 0.08),
                                                color: outstanding > 0 ? '#C0392B' : PRIMARY,
                                                fontWeight: outstanding > 0 ? 700 : 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                sx={{
                                                    flex: 1,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: alpha(PRIMARY, 0.1),
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: complete ? PRIMARY : '#E69620',
                                                        borderRadius: 4,
                                                    },
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
                                                {Math.round(pct)}%
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <DeliveryHistory receipts={receipts} />

            <ReceiveDeliveryDialog
                open={receiveOpen}
                stockId={inventory.id as number}
                lines={commodities}
                onClose={() => setReceiveOpen(false)}
                onSaved={() => {
                    setReceiveOpen(false);
                    loadReceipts();
                    onDeliveryReceived?.();
                }}
            />

            <CloseShortDialog
                open={closeShortOpen}
                stockId={inventory.id as number}
                outstanding={totalOutstanding}
                onClose={() => setCloseShortOpen(false)}
                onSaved={() => {
                    setCloseShortOpen(false);
                    onDeliveryReceived?.();
                }}
            />
        </Box>
    );
};

/** Every physical delivery recorded against this order, with the GRN each one produced. */
const DeliveryHistory = ({ receipts }: { receipts: IStockReceipt[] }) => {
    if (receipts.length === 0) return null;

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: PRIMARY }} />
                Delivery History
                <Chip
                    label={`${receipts.length} receipt${receipts.length === 1 ? '' : 's'}`}
                    size="small"
                    sx={{ height: 20, fontWeight: 600, bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }}
                />
            </Typography>

            <Stack spacing={1.25}>
                {receipts.map((receipt) => (
                    <Paper
                        key={receipt.id}
                        elevation={0}
                        sx={{ p: 1.75, borderRadius: 2, border: `1px solid ${alpha('#000', 0.08)}` }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                <Chip
                                    label={receipt.grnNumber || 'GRN pending'}
                                    size="small"
                                    sx={{ height: 22, fontWeight: 700, bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {receipt.receiptDate ? moment(receipt.receiptDate).format('DD MMM YYYY') : '—'}
                                </Typography>
                                {receipt.deliveryNoteNumber && (
                                    <Typography variant="caption" color="text.secondary">
                                        DN: {receipt.deliveryNoteNumber}
                                    </Typography>
                                )}
                                {receipt.invoiceNumber && (
                                    <Typography variant="caption" color="text.secondary">
                                        Inv: {receipt.invoiceNumber}
                                    </Typography>
                                )}
                                {receipt.receivedByName && (
                                    <Typography variant="caption" color="text.secondary">
                                        Received by {receipt.receivedByName}
                                    </Typography>
                                )}
                            </Stack>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY, whiteSpace: 'nowrap' }}>
                                +{receipt.totalQuantityReceived} unit{receipt.totalQuantityReceived === 1 ? '' : 's'}
                            </Typography>
                        </Stack>

                        {(receipt.lines?.length ?? 0) > 0 && (
                            <>
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={0.5}>
                                    {receipt.lines.map((line) => (
                                        <Typography key={line.commodityId} variant="caption" color="text.secondary">
                                            {line.commodityName}: <strong>{line.quantityReceived}</strong>
                                        </Typography>
                                    ))}
                                </Stack>
                            </>
                        )}

                        {receipt.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontStyle: 'italic' }}>
                                {receipt.notes}
                            </Typography>
                        )}
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
};

const CloseShortDialog = ({
    open,
    stockId,
    outstanding,
    onClose,
    onSaved,
}: {
    open: boolean;
    stockId: number;
    outstanding: number;
    onClose: () => void;
    onSaved: () => void;
}) => {
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        setReason('');
        onClose();
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await closeShortService(stockId, reason.trim());
            toast.success('Delivery closed short.');
            setReason('');
            onSaved();
        } catch (e) {
            // toast handled by axios interceptor
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Close delivery short
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {outstanding.toLocaleString()} unit{outstanding === 1 ? '' : 's'} outstanding will be accepted as undelivered
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This marks the stock as <strong>Closed Short</strong>. Already-received units and their
                    assets are unaffected. You can still receive more later if the supplier delivers.
                </Alert>
                {/* Mirrors the "Notes" section of the Record a Delivery dialog so the two
                    receipt-side dialogs read as one family. */}
                <Paper elevation={0} sx={panelSx}>
                    <SectionHeader title="Reason" hint="Optional" />
                    <TextField
                        fullWidth
                        size="medium"
                        multiline
                        rows={3}
                        label="Close-short reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. supplier cancelled the balance, item discontinued, order superseded…"
                        helperText="Recorded against this stock and shown wherever it appears as closed short"
                        sx={fieldSx}
                    />
                </Paper>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    variant="contained"
                    color="warning"
                    sx={{ textTransform: 'none' }}
                >
                    Confirm close short
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const SummaryStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <Paper
        elevation={0}
        sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            border: `1px solid ${alpha(color, 0.25)}`,
            bgcolor: alpha(color, 0.06),
            minWidth: 84,
            textAlign: 'center',
        }}
    >
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', display: 'block' }}>
            {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
            {value.toLocaleString()}
        </Typography>
    </Paper>
);

/**
 * Records one physical delivery covering however many lines arrived on it.
 *
 * <p>Quantities entered here are what arrived <b>in this batch</b>; the server adds them to what has
 * already been received. Submitting produces exactly one receipt, one GRN, one store credit and one
 * batch of assets, all in one transaction.
 */
const ReceiveDeliveryDialog = ({
    open,
    stockId,
    lines,
    onClose,
    onSaved,
}: {
    open: boolean;
    stockId: number;
    lines: IStockCommodities[];
    onClose: () => void;
    onSaved: () => void;
}) => {
    const outstandingLines = useMemo(
        () => lines.filter((l) => Math.max((l.orderedQuantity || 0) - (l.deliveredQuantity || 0), 0) > 0),
        [lines]
    );

    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [prices, setPrices] = useState<Record<number, { cost: string; purchase: string }>>({});
    const [receiptDate, setReceiptDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    // Batch-specific pricing is the exception, so the price columns stay collapsed by default
    // rather than crowding the quantities that every receipt actually needs.
    const [showPrices, setShowPrices] = useState(false);
    // Fixed for the lifetime of one open dialog, so a double-click or a retry after a dropped
    // response resolves to the receipt already recorded instead of receiving the batch twice.
    const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());

    useEffect(() => {
        if (open) {
            setQuantities({});
            setPrices({});
            setReceiptDate(moment().format('YYYY-MM-DD'));
            setDeliveryNoteNumber('');
            setInvoiceNumber('');
            setNotes('');
            setShowPrices(false);
            setIdempotencyKey(crypto.randomUUID());
        }
    }, [open]);

    const outstandingFor = (line: IStockCommodities) =>
        Math.max((line.orderedQuantity || 0) - (line.deliveredQuantity || 0), 0);

    const setQuantity = (commodityId: number, raw: string, max: number) => {
        if (raw === '') {
            setQuantities((prev) => ({ ...prev, [commodityId]: '' }));
            return;
        }
        const parsed = Math.max(0, Math.min(max, parseInt(raw, 10) || 0));
        setQuantities((prev) => ({ ...prev, [commodityId]: String(parsed) }));
    };

    const receiveEverything = () => {
        const all: Record<number, string> = {};
        outstandingLines.forEach((line) => {
            const id = line.commodity?.id as number;
            if (id != null) all[id] = String(outstandingFor(line));
        });
        setQuantities(all);
    };

    const totalReceiving = outstandingLines.reduce((sum, line) => {
        const id = line.commodity?.id as number;
        return sum + (parseInt(quantities[id] ?? '', 10) || 0);
    }, 0);

    const handleSubmit = async () => {
        const payloadLines = outstandingLines
            .map((line) => {
                const id = line.commodity?.id as number;
                const qty = parseInt(quantities[id] ?? '', 10) || 0;
                if (qty <= 0) return null;
                const price = prices[id];
                // Compared against '' rather than truthiness so an explicit 0 is respected
                // instead of silently falling back to the order's price.
                const cost = price?.cost !== undefined && price.cost !== '' ? Number(price.cost) : line.costPrice;
                const purchase = price?.purchase !== undefined && price.purchase !== '' ? Number(price.purchase) : line.purchasePrice;
                return {
                    commodityId: id,
                    deliveredQuantity: qty,
                    orderedQuantity: line.orderedQuantity || 0,
                    costPrice: cost,
                    purchasePrice: purchase,
                };
            })
            .filter(Boolean);

        if (payloadLines.length === 0) {
            toast.error('Enter the quantity received for at least one item.');
            return;
        }

        setSaving(true);
        try {
            await receiveDeliveryService(
                {
                    lines: payloadLines,
                    receiptDate: `${receiptDate}T00:00:00`,
                    deliveryNoteNumber: deliveryNoteNumber.trim() || null,
                    invoiceNumber: invoiceNumber.trim() || null,
                    notes: notes.trim() || null,
                    idempotencyKey,
                },
                stockId
            );
            toast.success(`Delivery recorded — ${totalReceiving} unit(s) received.`);
            onSaved();
        } catch (e) {
            // toast handled by axios interceptor
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const totalOutstanding = outstandingLines.reduce((sum, line) => sum + outstandingFor(line), 0);
    const linesTouched = outstandingLines.filter((line) => (parseInt(quantities[line.commodity?.id as number] ?? '', 10) || 0) > 0).length;
    const everythingSelected = totalOutstanding > 0 && totalReceiving === totalOutstanding;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            // Widens when the price columns are revealed, so the money fields get room to breathe
            // instead of forcing the items table into a horizontal scroll.
            maxWidth={showPrices ? 'lg' : 'md'}
            fullWidth
            PaperProps={{
                sx: { borderRadius: `${radii.xl}px`, boxShadow: elevation.overlay, overflow: 'hidden' },
            }}
        >
            {/* ── Header ── */}
            <DialogTitle
                sx={{
                    p: 0,
                    borderBottom: `1px solid ${border.subtle}`,
                    bgcolor: surface.card,
                }}
            >
                <Box sx={{ px: { xs: 2.5, sm: 3 }, py: 2.25, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: 1.75, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(brand[500], 0.09),
                            border: `1px solid ${alpha(brand[500], 0.18)}`,
                            color: brand[600],
                        }}
                    >
                        <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: neutral[900], lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                            Record a Delivery
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: neutral[500], mt: 0.2 }}>
                            Enter what arrived in this batch — one delivery note becomes one GRN
                        </Typography>
                    </Box>

                    {totalOutstanding > 0 && (
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' }, pr: 0.5 }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                Outstanding
                            </Typography>
                            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: neutral[900], lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                                {totalOutstanding.toLocaleString()}
                            </Typography>
                        </Box>
                    )}

                    <IconButton
                        size="small"
                        onClick={onClose}
                        sx={{ color: neutral[400], '&:hover': { bgcolor: neutral[100], color: neutral[700] } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: surface.muted }}>
                {outstandingLines.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            Everything on this order has already been received.
                        </Alert>
                    </Box>
                ) : (
                    <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
                        {/* ── 1 · Delivery details ── */}
                        <Paper elevation={0} sx={panelSx}>
                            <SectionHeader
                                index={1}
                                title="Delivery details"
                                hint="Identifies this specific batch on the GRN"
                            />
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} md={4}>
                                    <DeliveryDatePicker value={receiptDate} onChange={setReceiptDate} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        size="medium"
                                        label="Delivery Note No."
                                        placeholder="e.g. DN-04821"
                                        value={deliveryNoteNumber}
                                        onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                                        helperText="Supplier's waybill reference"
                                        sx={fieldSx}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        size="medium"
                                        label="Invoice No."
                                        placeholder="e.g. INV-2291"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        helperText="If one came with this batch"
                                        sx={fieldSx}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* ── 2 · Items ── */}
                        <Paper elevation={0} sx={panelSx}>
                            <SectionHeader
                                index={2}
                                title="Items received"
                                hint="Leave a line at zero if it wasn't on this delivery"
                                action={
                                    <Button
                                        size="small"
                                        onClick={everythingSelected ? () => setQuantities({}) : receiveEverything}
                                        startIcon={<DoneAllRoundedIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            textTransform: 'none', fontWeight: 700, fontSize: '0.76rem',
                                            borderRadius: `${radii.pill}px`, px: 1.5,
                                            color: brand[700], bgcolor: alpha(brand[500], 0.08),
                                            '&:hover': { bgcolor: alpha(brand[500], 0.14) },
                                        }}
                                    >
                                        {everythingSelected ? 'Clear all' : 'Receive all outstanding'}
                                    </Button>
                                }
                            />

                            <TableContainer sx={{ overflowX: 'auto', border: `1px solid ${border.subtle}`, borderRadius: `${radii.md}px` }}>
                                <Table size="small" sx={{ minWidth: showPrices ? 900 : 520 }}>
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                '& th': {
                                                    bgcolor: alpha(brand[500], 0.04),
                                                    borderBottom: `1px solid ${border.subtle}`,
                                                    fontWeight: 700, fontSize: '0.66rem', color: brand[700],
                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                    py: 1.25, whiteSpace: 'nowrap',
                                                },
                                            }}
                                        >
                                            <TableCell>Commodity</TableCell>
                                            <TableCell align="center">Outstanding</TableCell>
                                            <TableCell align="center" sx={{ width: 168 }}>Received now</TableCell>
                                            {showPrices && <TableCell sx={{ width: 190 }}>Cost price</TableCell>}
                                            {showPrices && <TableCell sx={{ width: 190 }}>Purchase price</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {outstandingLines.map((line, idx) => {
                                            const id = line.commodity?.id as number;
                                            const outstanding = outstandingFor(line);
                                            const qty = parseInt(quantities[id] ?? '', 10) || 0;
                                            const active = qty > 0;

                                            return (
                                                <TableRow
                                                    key={id}
                                                    sx={{
                                                        bgcolor: active ? alpha(brand[500], 0.035) : idx % 2 ? alpha(neutral[900], 0.012) : 'transparent',
                                                        transition: 'background 0.15s ease',
                                                        '&:hover': { bgcolor: active ? alpha(brand[500], 0.055) : alpha(neutral[900], 0.03) },
                                                        '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.25 },
                                                        '&:last-of-type td': { borderBottom: 'none' },
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                                            <Box
                                                                sx={{
                                                                    width: 6, height: 30, borderRadius: 3, flexShrink: 0,
                                                                    bgcolor: active ? brand[500] : 'transparent',
                                                                    transition: 'background 0.15s ease',
                                                                }}
                                                            />
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: neutral[900], lineHeight: 1.35 }}>
                                                                    {line.commodity?.name ?? '—'}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '0.71rem', color: neutral[500] }}>
                                                                    {line.deliveredQuantity || 0} of {line.orderedQuantity || 0} received so far
                                                                    {line.commodity?.groupName ? ` · ${line.commodity.groupName}` : ''}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                display: 'inline-flex', minWidth: 32, justifyContent: 'center',
                                                                px: 1, py: 0.35, borderRadius: `${radii.sm}px`,
                                                                fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                                                                color: statusTokens.warning.strong, bgcolor: statusTokens.warning.soft,
                                                            }}
                                                        >
                                                            {outstanding}
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell align="center">
                                                        <QuantityStepper
                                                            value={quantities[id] ?? ''}
                                                            max={outstanding}
                                                            onChange={(raw) => setQuantity(id, raw, outstanding)}
                                                        />
                                                    </TableCell>

                                                    {showPrices && (
                                                        <TableCell>
                                                            <MoneyField
                                                                value={prices[id]?.cost ?? ''}
                                                                fallback={line.costPrice}
                                                                onChange={(v) =>
                                                                    setPrices((prev) => ({
                                                                        ...prev,
                                                                        [id]: { cost: v, purchase: prev[id]?.purchase ?? '' },
                                                                    }))
                                                                }
                                                            />
                                                        </TableCell>
                                                    )}
                                                    {showPrices && (
                                                        <TableCell>
                                                            <MoneyField
                                                                value={prices[id]?.purchase ?? ''}
                                                                fallback={line.purchasePrice}
                                                                onChange={(v) =>
                                                                    setPrices((prev) => ({
                                                                        ...prev,
                                                                        [id]: { cost: prev[id]?.cost ?? '', purchase: v },
                                                                    }))
                                                                }
                                                            />
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Prices are rarely batch-specific, so they stay out of the way until asked for. */}
                            <Button
                                size="small"
                                onClick={() => setShowPrices(!showPrices)}
                                startIcon={<TuneRoundedIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                    mt: 1.25, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                    color: showPrices ? brand[700] : neutral[500], px: 0.5,
                                    '&:hover': { bgcolor: 'transparent', color: brand[600] },
                                }}
                            >
                                {showPrices ? 'Hide batch pricing' : 'This batch was priced differently'}
                            </Button>
                        </Paper>

                        {/* ── 3 · Notes ── */}
                        <Paper elevation={0} sx={panelSx}>
                            <SectionHeader index={3} title="Notes" hint="Optional" />
                            <TextField
                                fullWidth
                                size="medium"
                                multiline
                                rows={3}
                                label="Receipt notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Condition on arrival, discrepancies against the delivery note, items rejected…"
                                helperText="Recorded against this receipt and shown in the delivery history"
                                sx={fieldSx}
                            />
                        </Paper>
                    </Stack>
                )}
            </DialogContent>

            {/* ── Footer ── */}
            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 }, py: 2,
                    borderTop: `1px solid ${border.subtle}`,
                    bgcolor: surface.card,
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: totalReceiving > 0 ? alpha(brand[500], 0.1) : neutral[100],
                            color: totalReceiving > 0 ? brand[600] : neutral[400],
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <ReceiptLongOutlinedIcon sx={{ fontSize: 19 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums', color: totalReceiving > 0 ? neutral[900] : neutral[400] }}>
                            {totalReceiving.toLocaleString()} unit{totalReceiving === 1 ? '' : 's'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: neutral[500] }}>
                            {totalReceiving > 0
                                ? `across ${linesTouched} line${linesTouched === 1 ? '' : 's'} · issues 1 GRN`
                                : 'nothing selected yet'}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
                    <Button
                        onClick={onClose}
                        disabled={saving}
                        sx={{
                            textTransform: 'none', fontWeight: 600, height: 42, px: 2.5,
                            borderRadius: `${radii.pill}px`, color: neutral[600],
                            '&:hover': { bgcolor: neutral[100], color: neutral[800] },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || totalReceiving === 0 || outstandingLines.length === 0}
                        variant="contained"
                        disableElevation
                        startIcon={saving
                            ? <CircularProgress size={15} sx={{ color: '#fff' }} />
                            : <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: 'none', fontWeight: 700, fontSize: '0.87rem',
                            height: 42, px: 3, borderRadius: `${radii.pill}px`, whiteSpace: 'nowrap',
                            background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
                            boxShadow: `0 6px 16px ${alpha(brand[500], 0.3)}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${brand[600]} 0%, ${brand[700]} 100%)`,
                                boxShadow: `0 9px 22px ${alpha(brand[500], 0.4)}`,
                                transform: 'translateY(-1px)',
                            },
                            '&.Mui-disabled': { background: neutral[200], color: neutral[400], boxShadow: 'none' },
                        }}
                    >
                        {saving ? 'Recording…' : 'Confirm & Issue GRN'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

/** Card wrapper shared by the dialog's three sections. */
const panelSx = {
    p: { xs: 1.75, sm: 2.25 },
    borderRadius: `${radii.lg}px`,
    border: `1px solid ${border.subtle}`,
    bgcolor: surface.card,
};

/**
 * Section heading with an optional right-aligned action. The numbered badge is only rendered when
 * an `index` is given — a dialog with a single section shouldn't imply a numbered sequence.
 */
const SectionHeader = ({ index, title, hint, action }: {
    index?: number; title: string; hint?: string; action?: ReactNode;
}) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            {index !== undefined && (
            <Box
                sx={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(brand[500], 0.1), color: brand[700],
                    fontSize: '0.68rem', fontWeight: 800,
                }}
            >
                {index}
            </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: neutral[800], lineHeight: 1.3 }}>
                    {title}
                </Typography>
                {hint && (
                    <Typography sx={{ fontSize: '0.7rem', color: neutral[500] }}>{hint}</Typography>
                )}
            </Box>
        </Stack>
        {action}
    </Stack>
);

/** Compact −/+ stepper for the quantity received on a line. */
const QuantityStepper = ({ value, max, onChange }: {
    value: string; max: number; onChange: (raw: string) => void;
}) => {
    const current = parseInt(value, 10) || 0;
    const active = current > 0;

    return (
        <Box
            sx={{
                display: 'inline-flex', alignItems: 'center', mx: 'auto',
                borderRadius: `${radii.md}px`,
                border: `1px solid ${active ? alpha(brand[500], 0.45) : border.default}`,
                bgcolor: active ? alpha(brand[500], 0.05) : surface.card,
                transition: 'border-color 0.15s ease, background 0.15s ease',
                '&:focus-within': { borderColor: brand[500], boxShadow: `0 0 0 3px ${alpha(brand[500], 0.12)}` },
            }}
        >
            <IconButton
                size="small"
                disabled={current <= 0}
                onClick={() => onChange(String(current - 1))}
                sx={{ color: neutral[500], '&:hover': { bgcolor: alpha(neutral[900], 0.05) }, '&.Mui-disabled': { color: neutral[300] } }}
            >
                <RemoveRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>

            <TextField
                variant="standard"
                type="number"
                value={value}
                placeholder="0"
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ min: 0, max }}
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        width: 46,
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: active ? brand[700] : neutral[700],
                        input: { textAlign: 'center', padding: '4px 0' },
                        '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                        '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                        '& input[type=number]': { MozAppearance: 'textfield' },
                    },
                }}
            />

            <IconButton
                size="small"
                disabled={current >= max}
                onClick={() => onChange(String(current + 1))}
                sx={{ color: brand[600], '&:hover': { bgcolor: alpha(brand[500], 0.1) }, '&.Mui-disabled': { color: neutral[300] } }}
            >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
        </Box>
    );
};

/**
 * Date the batch physically arrived. Uses the same MUI picker, format and styling as the Create
 * Inventory form's date fields — a real calendar rather than a bare `type="date"` box, because this
 * value sets the depreciation start date for every asset in the batch.
 */
const DeliveryDatePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const parsed: Dayjs | null = value ? dayjs(value) : null;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                format="DD-MM-YYYY"
                label="Date Received"
                value={parsed}
                onChange={(next) => onChange(next ? next.format('YYYY-MM-DD') : '')}
                slotProps={{
                    textField: {
                        size: 'medium',
                        fullWidth: true,
                        required: true,
                        helperText: 'Starts depreciation for this batch',
                        sx: {
                            ...fieldSx,
                            '& .MuiInputAdornment-root .MuiIconButton-root': {
                                color: neutral[400],
                                '&:hover': { color: brand[500], backgroundColor: alpha(brand[500], 0.06) },
                            },
                        },
                    },
                    popper: {
                        sx: {
                            '& .MuiPaper-root': {
                                borderRadius: `${radii.lg}px`,
                                boxShadow: elevation.floating,
                                mt: 0.5,
                            },
                            '& .MuiPickersDay-root': {
                                borderRadius: `${radii.sm}px`,
                                fontSize: '0.8125rem',
                                '&:hover': { backgroundColor: alpha(brand[500], 0.08) },
                                '&.Mui-selected': {
                                    backgroundColor: brand[500],
                                    '&:hover': { backgroundColor: brand[700] },
                                    '&:focus': { backgroundColor: brand[500] },
                                },
                                '&.MuiPickersDay-today': { borderColor: brand[500] },
                            },
                            '& .MuiDayCalendar-weekDayLabel': {
                                color: alpha(brand[500], 0.7),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            },
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

/**
 * Currency input that groups thousands as you type, matching the Stock Items table.
 *
 * <p>The stored value stays a plain unformatted number string, so the payload never carries the
 * separators. `fallback` is the order's current unit price, shown as the placeholder so it is clear
 * what applies when the field is left empty.
 */
const MoneyField = ({ value, fallback, onChange }: {
    value: string;
    fallback?: number | null;
    onChange: (v: string) => void;
}) => (
    <TextField
        fullWidth
        size="medium"
        type="text"
        // On the input itself, not the wrapper, so mobile actually gets the numeric keypad.
        inputProps={{ inputMode: 'numeric' }}
        value={formatNumberWithCommas(value)}
        placeholder={formatNumberWithCommas(fallback ?? 0)}
        onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '');
            if (raw === '') {
                onChange('');
                return;
            }
            const numeric = Number(raw);
            if (!isNaN(numeric)) onChange(raw);
        }}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: neutral[400], letterSpacing: '0.04em' }}>
                        UGX
                    </Typography>
                </InputAdornment>
            ),
        }}
        sx={{
            ...fieldSx,
            '& .MuiInputBase-input': {
                ...fieldSx['& .MuiInputBase-input'],
                textAlign: 'right',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                paddingLeft: '4px',
            },
        }}
    />
);

export default DeliveryStatusPanel;
