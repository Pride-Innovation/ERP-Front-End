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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { toast } from 'react-toastify';

import { IInventory, IStockCommodities } from '../interface';
import axiosInstance from '../../../core/apis/axiosInstance';

const PRIMARY = '#08796C';

interface Props {
    inventory: IInventory;
    onDeliveryReceived?: () => void;
}

/**
 * Per-commodity delivery-status table for a single Stock. Shows ordered vs
 * delivered vs outstanding, with an inline "Receive more" action on any row
 * where outstanding > 0. Posts to /stocks/{id}/complete-delivery which the
 * backend uses to (a) update delivered quantity, (b) auto-create the extra
 * Asset rows in `requireUpdate` status, and (c) notify the responsible team.
 */
const DeliveryStatusPanel = ({ inventory, onDeliveryReceived }: Props) => {
    const theme = useTheme();
    const commodities = inventory.commodities ?? [];

    const [receivingRow, setReceivingRow] = useState<IStockCommodities | null>(null);

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
                        Ordered vs delivered per commodity. Use "Receive more" when a supplier ships an additional batch.
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
                            <TableCell sx={{ fontWeight: 700, width: 220 }}>Progress</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
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
                                        {outstanding > 0 ? (
                                            <Chip
                                                label={outstanding}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    bgcolor: alpha('#ef4444', 0.08),
                                                    color: '#C0392B',
                                                    fontWeight: 700,
                                                }}
                                            />
                                        ) : (
                                            <Chip
                                                label="0"
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    bgcolor: alpha(PRIMARY, 0.08),
                                                    color: PRIMARY,
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
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
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        {complete ? (
                                            <Chip
                                                label="Complete"
                                                size="small"
                                                icon={<CheckCircleOutlineIcon fontSize="small" />}
                                                sx={{
                                                    height: 22,
                                                    bgcolor: alpha(PRIMARY, 0.08),
                                                    color: PRIMARY,
                                                    fontWeight: 600,
                                                    '& .MuiChip-icon': { color: PRIMARY },
                                                }}
                                            />
                                        ) : (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => setReceivingRow(c)}
                                                startIcon={<AddTaskOutlinedIcon fontSize="small" />}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    borderColor: alpha(PRIMARY, 0.4),
                                                    color: PRIMARY,
                                                    '&:hover': { borderColor: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                                                }}
                                            >
                                                Receive more
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <ReceiveMoreDialog
                row={receivingRow}
                stockId={inventory.id as number}
                onClose={() => setReceivingRow(null)}
                onSaved={() => {
                    setReceivingRow(null);
                    onDeliveryReceived?.();
                }}
            />
        </Box>
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

const ReceiveMoreDialog = ({
    row,
    stockId,
    onClose,
    onSaved,
}: {
    row: IStockCommodities | null;
    stockId: number;
    onClose: () => void;
    onSaved: () => void;
}) => {
    const [qty, setQty] = useState<string>('');
    const [grnNumber, setGrnNumber] = useState<string>('');
    const [costPrice, setCostPrice] = useState<string>('');
    const [purchasePrice, setPurchasePrice] = useState<string>('');
    const [saving, setSaving] = useState(false);

    if (!row) return null;

    const ordered = row.orderedQuantity || 0;
    const delivered = row.deliveredQuantity || 0;
    const outstanding = Math.max(ordered - delivered, 0);

    const reset = () => {
        setQty('');
        setGrnNumber('');
        setCostPrice('');
        setPurchasePrice('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const parsedQty = Number(qty);
        if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
            toast.error('Enter a quantity greater than zero.');
            return;
        }
        if (parsedQty > outstanding) {
            toast.error(`You can receive at most ${outstanding} more unit${outstanding === 1 ? '' : 's'}.`);
            return;
        }
        if (!grnNumber.trim()) {
            toast.error('GRN reference is required for this top-up delivery.');
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.post(`stocks/${stockId}/complete-delivery`, {
                grnNumber: grnNumber.trim(),
                additionalDeliveries: [
                    {
                        commodityId: row.commodity?.id,
                        deliveredQuantity: parsedQty,
                        orderedQuantity: ordered,
                        costPrice: costPrice ? Number(costPrice) : row.costPrice,
                        purchasePrice: purchasePrice ? Number(purchasePrice) : row.purchasePrice,
                    },
                ],
            });
            toast.success(`Received ${parsedQty} more ${row.commodity?.name ?? 'unit(s)'}.`);
            reset();
            onSaved();
        } catch (e) {
            // toast handled by axios interceptor
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={!!row} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Receive additional delivery
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {row.commodity?.name} · {outstanding} unit{outstanding === 1 ? '' : 's'} outstanding
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <FieldRow
                        label="Quantity received now *"
                        helper={`Maximum ${outstanding}`}
                        value={qty}
                        onChange={setQty}
                        type="number"
                    />
                    <FieldRow
                        label="GRN reference *"
                        helper="Goods Received Note number for this top-up"
                        value={grnNumber}
                        onChange={setGrnNumber}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <FieldRow
                            label="Cost price"
                            value={costPrice}
                            onChange={setCostPrice}
                            type="number"
                            helper={`Default: ${row.costPrice ?? '—'}`}
                        />
                        <FieldRow
                            label="Purchase price"
                            value={purchasePrice}
                            onChange={setPurchasePrice}
                            type="number"
                            helper={`Default: ${row.purchasePrice ?? '—'}`}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={saving} sx={{ textTransform: 'none' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        bgcolor: PRIMARY,
                        '&:hover': { bgcolor: '#065E53' },
                    }}
                >
                    Confirm receipt
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const FieldRow = ({
    label,
    helper,
    value,
    onChange,
    type = 'text',
}: {
    label: string;
    helper?: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) => (
    <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <TextField
            size="small"
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type={type}
            helperText={helper}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: PRIMARY },
                    '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                },
            }}
        />
    </Box>
);

export default DeliveryStatusPanel;
