/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useContext, useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    IconButton,
    TextField,
    Button,
    Typography,
    alpha,
    Tooltip,
    Stack,
    Zoom,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CommodityUtills from '../../pages/settings/commodity/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RequestContext } from '../../context/request/RequestContext';
import { toast } from 'react-toastify';
import { StockRowData } from '../forms/interface';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import EighteenMpOutlinedIcon from '@mui/icons-material/EighteenMpOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PriceTotals from './priceTotals';
import { formatNumberWithCommas } from './helper';
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { neutral, border, status as statusTokens } from '../../utils/tokens';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';
// Opaque on purpose: the head is `stickyHeader`, and a translucent `alpha()` fill would let the
// rows scroll visibly through it. This is the flat equivalent of PRIMARY_COLOR at 4% over white.
const TABLE_HEADER_BG = '#F5FAF9';
const TABLE_HEADER_COLOR = PRIMARY_COLOR;
const TABLE_BORDER_COLOR = alpha(PRIMARY_COLOR, 0.08);

// Mirrors the "Request Items" table (InventoryTable.tsx) so the selected value
// text and inputs render at the exact same size/weight across both tables.
const selectSx = {
    fontSize: '0.95rem',
    fontWeight: 600,
    borderRadius: '8px',
    backgroundColor: 'white',
    height: '44px',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(PRIMARY_COLOR, 0.15),
        borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha(PRIMARY_COLOR, 0.4),
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: PRIMARY_COLOR,
        borderWidth: '2px',
    },
};

/**
 * Segmented −/value/+ quantity control.
 *
 * The middle segment is a real input: stepping is fine for a handful of units, but a 200-unit
 * line has to be typeable. Uses `type=text` + `inputMode=numeric` rather than `type=number`, so
 * the scroll wheel can never silently alter a committed quantity and the native spinners stay
 * hidden. Declared at module scope — defined inside the parent it would remount on every render
 * and drop focus after each keystroke.
 */
const QuantityStepper = ({ value, onChange, min = 0, max, ariaLabel }: {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    ariaLabel: string;
}) => {
    const stepBtnSx = {
        borderRadius: 0,
        width: 40,
        height: CONTROL_H - 3, // less the 1.5px border top and bottom
        '&.Mui-disabled': { color: alpha(neutral[900], 0.18) },
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: '#fff',
                border: `1.5px solid ${alpha(PRIMARY_COLOR, 0.22)}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.15s ease',
                '&:focus-within': { borderColor: PRIMARY_COLOR },
            }}
        >
            <IconButton
                size="small"
                aria-label={`Decrease ${ariaLabel}`}
                disabled={value <= min}
                onClick={() => onChange(value - 1)}
                sx={{ ...stepBtnSx, color: SECONDARY_COLOR, '&:hover': { bgcolor: alpha(SECONDARY_COLOR, 0.1) } }}
            >
                <RemoveCircleOutlineIcon sx={{ fontSize: 19 }} />
            </IconButton>

            <TextField
                variant="standard"
                value={value}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
                inputProps={{ inputMode: 'numeric', 'aria-label': ariaLabel }}
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        width: 58,
                        height: CONTROL_H - 3,
                        borderLeft: `1px solid ${alpha(PRIMARY_COLOR, 0.14)}`,
                        borderRight: `1px solid ${alpha(PRIMARY_COLOR, 0.14)}`,
                        '& input': {
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: neutral[900],
                            padding: 0,
                        },
                    },
                }}
            />

            <IconButton
                size="small"
                aria-label={`Increase ${ariaLabel}`}
                disabled={max !== undefined && value >= max}
                onClick={() => onChange(value + 1)}
                sx={{ ...stepBtnSx, color: PRIMARY_COLOR, '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.1) } }}
            >
                <AddCircleOutlineOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>
        </Box>
    );
};

/** Shared height for every interactive control in a row, so they line up across columns. */
const CONTROL_H = 44;

/**
 * Shared body-cell style.
 *
 * `verticalAlign: top` is the important part: a `<td>` centres its content by default, so the
 * moment one cell grew taller than the rest (the price cells, which carry a line-total caption
 * underneath) its input floated upwards out of line with every other column. Pinning all cells
 * to the top keeps the inputs on one line and lets the captions hang below.
 */
const bodyCellSx = {
    borderBottom: `1px solid ${TABLE_BORDER_COLOR}`,
    py: 3,
    px: 2,
    verticalAlign: 'top' as const,
};

/**
 * Holds a control that is naturally shorter than {@link CONTROL_H} (a badge, a locked figure, an
 * icon button) centred inside the same band as the inputs, so its midline matches theirs.
 */
const ControlSlot = ({ children }: { children: ReactNode }) => (
    <Box sx={{ height: CONTROL_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
    </Box>
);

interface StockItemsProps {
    /**
     * Render Delivered as a read-only figure. Set on the correction page: what has been received
     * is owned by the receipt trail, because crediting the store, registering assets and issuing a
     * GRN all have to happen with it — none of which a correction form can do.
     */
    lockDeliveredQuantity?: boolean;
}

const StockItems = ({ lockDeliveredQuantity = false }: StockItemsProps) => {
    const { fetchAllCommodities } = CommodityUtills();
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string, assetTypeId: number | string }[]>([]);
    const [showPrices, setShowPrices] = useState(false);
    const { stockRows, setStockRows, setAssetType } = useContext(RequestContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    const handleInputChange = (id: number, field: keyof StockRowData, value: any) => {
        const updatedRows = stockRows.map((row) => {
            if (row.id !== id) return row;

            const updated = { ...row, [field]: value };

            // Auto-sync: when Cost Price changes, Purchase Price automatically mirrors it
            if (field === 'costPrice') {
                updated.purchasePrice = value;
            }

            return updated;
        });
        setStockRows(updatedRows);
    };

    // Changing Ordered keeps Delivered in step: a line that was fully delivered stays full
    // (delivered = ordered), while an intentional partial delivery is preserved but clamped so it
    // never exceeds the new ordered amount. Full delivery is the default so stocked asset items
    // actually register as assets (asset creation is driven by the DELIVERED quantity).
    const handleOrderedChange = (id: number, rawOrdered: number) => {
        const updatedRows = stockRows.map((row) => {
            if (row.id !== id) return row;

            // On the correction page Delivered is fixed, so Ordered simply cannot go below what
            // the supplier has already delivered — the server rejects it, and clamping here says
            // so immediately instead of at submit time.
            if (lockDeliveredQuantity) {
                const floor = row.deliveredQuantity || 0;
                return { ...row, orderedQuantity: Math.max(floor, rawOrdered || 0) };
            }

            const newOrdered = Math.max(0, rawOrdered || 0);
            const wasFull = (row.deliveredQuantity || 0) >= (row.orderedQuantity || 0);
            const newDelivered = wasFull
                ? newOrdered
                : Math.min(row.deliveredQuantity || 0, newOrdered);
            return { ...row, orderedQuantity: newOrdered, deliveredQuantity: newDelivered };
        });
        setStockRows(updatedRows);
    };

    const handleAssetTypeNameChange = (id: number, value: string) => {
        const updatedRows = stockRows.map((row) =>
            row.id === id ? { ...row, assetTypeId: value } : row
        );
        setStockRows(updatedRows);

        const selectedType = assetTypes.find((asstyp) => asstyp.id === value);
        if (selectedType) {
            setAssetType(selectedType);
            fetchAllCommodities({ assetTypeId: selectedType.id });
        }
    };

    const handleNameChange = (id: number, value: string) => {
        const selectedItem = commodities.find(item => item.name === value);

        if (!selectedItem) return;

        // Prevent the same commodity being added on two lines — it should be a single line
        // with a combined quantity.
        const alreadyUsed = stockRows.some(
            row => row.id !== id && row.commodityId === (selectedItem.id as number)
        );
        if (alreadyUsed) {
            toast.error(`"${value}" is already added. Adjust the quantity on its existing row instead.`);
            return;
        }

        const updatedRows = stockRows.map(row =>
            row.id === id
                ? {
                    ...row,
                    name: value,
                    groupName: selectedItem.groupName,
                    commodityId: selectedItem.id as number,
                }
                : row
        );
        setStockRows(updatedRows);
    };

    const handleAddRow = () => {
        const newId = Date.now();
        setStockRows([
            ...stockRows,
            {
                id: newId,
                name: '',
                groupName: '',
                orderedQuantity: 0,
                deliveredQuantity: 0,
                commodityId: undefined,
                costPrice: '',
                purchasePrice: ''
            },
        ]);
    };

    const handleRemoveRow = (id: number) => {
        setStockRows(stockRows.filter((row) => row.id !== id));
    };

    useEffect(() => {
        if (commodities && commodities.length > 0) {
            const options = commodities.map((item: any) => ({
                name: item.name,
                groupName: item.groupName,
                assetTypeId: item?.assetType?.id
            }));
            setItemOptions(prev => {
                const merged = [...options, ...prev];
                const uniqueByName = Array.from(new Map(merged.map(item => [item.name, item])).values());
                return uniqueByName;
            });
        }
    }, [commodities]);

    // Alignment lives on the header itself — the previous `idx === 2 || idx === 3` index maths
    // silently mis-aligned every column as soon as one was added or hidden.
    const tableHeaders: { name: string; icon?: JSX.Element; minWidth: number; align: 'left' | 'center' }[] = [
        {
            name: '#',
            minWidth: 56,
            align: 'center'
        },
        {
            name: 'Asset Type',
            icon: <AppRegistrationOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 160,
            align: 'left'
        },
        {
            name: 'Commodity',
            icon: <FeedOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 320,
            align: 'left'
        },
        {
            name: "Ordered Qty",
            icon: <EighteenMpOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 160,
            align: 'center'
        },
        {
            name: "Delivered Qty",
            icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 160,
            align: 'center'
        },
        {
            name: "Cost Price",
            icon: <AttachMoneyIcon sx={{ fontSize: 15 }} />,
            minWidth: 170,
            align: 'center'
        },
        ...(showPrices ? [{
            name: "Purchase Price",
            icon: <MonetizationOnOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 170,
            align: 'center' as const
        }] : []),
        {
            name: "Actions",
            icon: <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: 15 }} />,
            minWidth: 80,
            align: 'center'
        }
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                border: `1px solid ${border.subtle}`,
                overflow: 'hidden',
                bgcolor: '#fff',
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2.25,
                    borderBottom: `1px solid ${border.subtle}`,
                    bgcolor: '#fff',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1.75,
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                        }}
                    >
                        <ShoppingCartIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: neutral[900], lineHeight: 1.2 }}>
                            Stock Items
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500], fontSize: '0.75rem' }}>
                            Add and manage the items received in this delivery
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto', flexShrink: 0 }}>
                    <Tooltip title={showPrices ? "Hide purchase price column" : "View purchase price details"} arrow>
                        <Button
                            size="small"
                            startIcon={showPrices ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                            onClick={() => setShowPrices(!showPrices)}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                letterSpacing: '0.01em',
                                color: showPrices ? '#fff' : PRIMARY_COLOR,
                                backgroundColor: showPrices ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.08),
                                border: `1.5px solid ${showPrices ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.25)}`,
                                borderRadius: '8px',
                                px: 2,
                                py: 1,
                                height: 40,
                                transition: 'all 0.25s ease',
                                boxShadow: showPrices ? `0 2px 8px ${alpha(PRIMARY_COLOR, 0.25)}` : 'none',
                                '&:hover': {
                                    backgroundColor: showPrices ? alpha(PRIMARY_COLOR, 0.9) : alpha(PRIMARY_COLOR, 0.12),
                                    borderColor: PRIMARY_COLOR,
                                    boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.2)}`,
                                    transform: 'translateY(-1px)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            }}
                        >
                            {showPrices ? 'Hide pricing' : 'Show pricing'}
                        </Button>
                    </Tooltip>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={handleAddRow}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '0.01em',
                            backgroundColor: PRIMARY_COLOR,
                            color: '#fff',
                            // Matches the pricing toggle beside it — the two were 36px/6px vs
                            // 40px/8px, which read as a misalignment rather than a hierarchy.
                            borderRadius: '8px',
                            px: 2,
                            height: 40,
                            border: `1.5px solid ${PRIMARY_COLOR}`,
                            boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.25)}`,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                backgroundColor: alpha(PRIMARY_COLOR, 0.9),
                                boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
                                transform: 'translateY(-1px)',
                            },
                            '&:active': { transform: 'translateY(0)' },
                        }}
                    >
                        Add Item
                    </Button>
                </Stack>
            </Box>

            <TableContainer
                component={Box}
                sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#000', 0.2),
                        borderRadius: 3,
                    },
                }}
            >
                <Table size="medium" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((header) => (
                                <TableCell
                                    key={header.name}
                                    align={header.align}
                                    sx={{
                                        bgcolor: TABLE_HEADER_BG,
                                        color: TABLE_HEADER_COLOR,
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        borderBottom: `1.5px solid ${TABLE_BORDER_COLOR}`,
                                        py: 2,
                                        px: 2,
                                        whiteSpace: 'nowrap',
                                        minWidth: header.minWidth,
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={0.75}
                                        alignItems="center"
                                        sx={{ display: 'inline-flex' }}
                                    >
                                        {header.icon}
                                        <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}>
                                            {header.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {stockRows.map((row, index) => {
                            const orderedQty = row.orderedQuantity || 0;
                            // A price of 0 is legitimate (donated / zero-cost stock), so completeness
                            // tests for "a number was entered", not for truthiness.
                            const hasCost = typeof row.costPrice === 'number';
                            const isComplete = Boolean(row.assetTypeId) && Boolean(row.name) && orderedQty > 0 && hasCost;
                            const isTouched = Boolean(row.assetTypeId) || Boolean(row.name) || orderedQty > 0 || hasCost;
                            // Mirrors what validateStockItems() will reject on "Next", so the row is
                            // flagged here instead of only in a toast that names a row you can't spot.
                            const needsAttention = isTouched && !isComplete;

                            const accent = needsAttention
                                ? { fg: statusTokens.warning.strong, bg: statusTokens.warning.soft, rail: statusTokens.warning.main }
                                : isComplete
                                    ? { fg: PRIMARY_COLOR, bg: alpha(PRIMARY_COLOR, 0.1), rail: PRIMARY_COLOR }
                                    : { fg: neutral[400], bg: alpha(neutral[900], 0.05), rail: 'transparent' };

                            const costLineTotal = (Number(row.costPrice) || 0) * orderedQty;
                            const purchaseLineTotal = (Number(row.purchasePrice ?? row.costPrice) || 0) * orderedQty;

                            return (
                            <TableRow
                                key={row.id}
                                sx={{
                                    backgroundColor: needsAttention ? alpha(statusTokens.warning.main, 0.04) : '#fff',
                                    borderLeft: `4px solid ${accent.rail}`,
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: needsAttention
                                            ? alpha(statusTokens.warning.main, 0.07)
                                            : alpha(PRIMARY_COLOR, 0.03),
                                    },
                                }}
                            >
                                <TableCell align="center" sx={{ ...bodyCellSx, px: 1 }}>
                                    <ControlSlot>
                                        <Tooltip
                                            title={needsAttention ? 'This line is incomplete and will block the next step' : ''}
                                            arrow
                                            TransitionComponent={Zoom}
                                        >
                                            <Box
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 800,
                                                    color: accent.fg,
                                                    bgcolor: accent.bg,
                                                }}
                                            >
                                                {index + 1}
                                            </Box>
                                        </Tooltip>
                                    </ControlSlot>
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Select
                                        fullWidth
                                        value={row.assetTypeId || ""}
                                        onChange={(e) => handleAssetTypeNameChange(row.id, e.target.value as string)}
                                        displayEmpty
                                        size="medium"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }}
                                        sx={{
                                            ...selectSx,
                                            color: row.assetTypeId ? 'text.primary' : 'text.secondary',
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select Type</em>
                                        </MenuItem>
                                        {assetTypes.map((assetTyp) => (
                                            <MenuItem key={assetTyp.id} value={assetTyp.id}>
                                                {assetTyp.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                                        <Select
                                            fullWidth
                                            value={row.name}
                                            onChange={(e) => handleNameChange(row.id, e.target.value)}
                                            displayEmpty
                                            size="medium"
                                            disabled={!row.assetTypeId}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 300,
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                    }
                                                }
                                            }}
                                            sx={{
                                                ...selectSx,
                                                color: row.name ? 'text.primary' : 'text.secondary',
                                                '&.Mui-disabled': { bgcolor: '#F8FAFC' },
                                            }}
                                        >
                                            <MenuItem value="" disabled>
                                                <em>Select Item</em>
                                            </MenuItem>
                                            {itemOptions
                                                .filter(ele => ele.assetTypeId === row.assetTypeId)
                                                .map((item) => (
                                                    <MenuItem key={item.name} value={item.name}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        {row.groupName && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 5,
                                                        height: 5,
                                                        borderRadius: '50%',
                                                        bgcolor: PRIMARY_COLOR,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: neutral[600],
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                                        px: 0.85,
                                                        py: 0.5,
                                                        borderRadius: '5px',
                                                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.25)}`,
                                                        display: 'inline-block',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {row.groupName}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </TableCell>

                                <TableCell align="center" sx={bodyCellSx}>
                                    <QuantityStepper
                                        ariaLabel="Ordered quantity"
                                        value={orderedQty}
                                        min={lockDeliveredQuantity ? (row.deliveredQuantity || 0) : 0}
                                        onChange={(next) => handleOrderedChange(row.id, next)}
                                    />
                                </TableCell>

                                <TableCell align="center" sx={bodyCellSx}>
                                    {lockDeliveredQuantity ? (
                                        <ControlSlot>
                                            <Tooltip
                                                title='Received quantities are recorded as deliveries, so the store, the asset register and the GRN are updated together. Use "Receive Delivery" on this stock.'
                                                arrow
                                                TransitionComponent={Zoom}
                                            >
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.75,
                                                    px: 1.25,
                                                    py: 0.75,
                                                    borderRadius: '8px',
                                                    bgcolor: alpha(neutral[500], 0.08),
                                                    border: `1.5px solid ${alpha(neutral[500], 0.25)}`,
                                                    color: neutral[700],
                                                    cursor: 'help',
                                                }}>
                                                    <LockOutlinedIcon sx={{ fontSize: 14 }} />
                                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: neutral[800] }}>
                                                        {row.deliveredQuantity || 0}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </ControlSlot>
                                    ) : (
                                        <QuantityStepper
                                            ariaLabel="Delivered quantity"
                                            value={row.deliveredQuantity || 0}
                                            // Can never receive more than was ordered.
                                            max={orderedQty}
                                            onChange={(next) => handleInputChange(
                                                row.id,
                                                'deliveredQuantity',
                                                Math.min(orderedQty, Math.max(0, next))
                                            )}
                                        />
                                    )}
                                </TableCell>

                                <TableCell sx={bodyCellSx}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="text"
                                        value={formatNumberWithCommas(row.costPrice)}
                                        placeholder="0"
                                        inputProps={{ inputMode: 'decimal', 'aria-label': 'Cost price' }}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            const numeric = parseFloat(raw);
                                            if (!isNaN(numeric)) {
                                                handleInputChange(row.id, 'costPrice', numeric);
                                            } else if (e.target.value === '') {
                                                handleInputChange(row.id, 'costPrice', '');
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 44,
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                backgroundColor: 'white',
                                                '& input': {
                                                    textAlign: 'center',
                                                    letterSpacing: '0.03em',
                                                    padding: '0 !important',
                                                    color: PRIMARY_COLOR,
                                                },
                                                '& fieldset': {
                                                    borderColor: alpha(PRIMARY_COLOR, 0.2),
                                                    borderWidth: '1.5px',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: alpha(PRIMARY_COLOR, 0.4),
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '8px',
                                            },
                                        }}
                                    />
                                    {/* Extended value. A non-breaking space holds the height when it is
                                        empty, so rows don't jump as the price is typed. */}
                                    <Typography
                                        sx={{
                                            mt: 0.75,
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            color: neutral[500],
                                            textAlign: 'center',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {orderedQty > 0 && hasCost
                                            ? `× ${orderedQty} = ${formatNumberWithCommas(costLineTotal)}`
                                            : ' '}
                                    </Typography>
                                </TableCell>

                                {showPrices && (
                                <TableCell sx={bodyCellSx}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="text"
                                        // `??` not `||`: a deliberate purchase price of 0 is falsy, and
                                        // `||` silently rendered the cost price over the top of it.
                                        value={formatNumberWithCommas(row.purchasePrice ?? row.costPrice)}
                                        placeholder="0"
                                        inputProps={{ inputMode: 'decimal', 'aria-label': 'Purchase price' }}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            const numeric = parseFloat(raw);
                                            if (!isNaN(numeric)) {
                                                handleInputChange(row.id, 'purchasePrice', numeric);
                                            } else if (e.target.value === '') {
                                                handleInputChange(row.id, 'purchasePrice', '');
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 44,
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                backgroundColor: 'white',
                                                '& input': {
                                                    textAlign: 'center',
                                                    letterSpacing: '0.03em',
                                                    padding: '0 !important',
                                                    color: '#E6A500',
                                                },
                                                '& fieldset': {
                                                    borderColor: alpha('#E6A500', 0.2),
                                                    borderWidth: '1.5px',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#E6A500', 0.4),
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#E6A500',
                                                    borderWidth: '2px',
                                                },
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '8px',
                                            },
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            mt: 0.75,
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            color: neutral[500],
                                            textAlign: 'center',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {orderedQty > 0 && purchaseLineTotal > 0
                                            ? `× ${orderedQty} = ${formatNumberWithCommas(purchaseLineTotal)}`
                                            : ' '}
                                    </Typography>
                                </TableCell>
                                )}

                                <TableCell align="center" sx={bodyCellSx}>
                                    <ControlSlot>
                                        <Tooltip
                                            title={
                                                stockRows.length === 1
                                                    ? "Cannot remove the last item"
                                                    : lockDeliveredQuantity && (row.deliveredQuantity || 0) > 0
                                                        ? `Cannot remove — ${row.deliveredQuantity} unit(s) have already been received and are held in the store`
                                                        : "Remove item"
                                            }
                                            arrow
                                            TransitionComponent={Zoom}
                                        >
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleRemoveRow(row.id)}
                                                    disabled={
                                                        stockRows.length === 1
                                                        || (lockDeliveredQuantity && (row.deliveredQuantity || 0) > 0)
                                                    }
                                                    size="medium"
                                                    sx={{
                                                        '&:disabled': { opacity: 0.3 },
                                                        bgcolor: alpha('#f44336', 0.05),
                                                        '&:hover': { bgcolor: alpha('#f44336', 0.1) }
                                                    }}
                                                >
                                                    <RemoveCircleOutlineIcon fontSize="medium" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </ControlSlot>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, borderTop: `1px solid ${border.subtle}`, bgcolor: '#FAFBFC' }}>
                <PriceTotals showPrices={showPrices} />
            </Box>
        </Paper>
    );
};

export default StockItems;