/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useContext, useEffect, useState } from "react";
import {
    Grid,
    Box,
    Typography,
    alpha,
    Chip,
    Stack,
    Button as MuiButton,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { IInventory, IInventoryAxiosResponse } from "./interface";
import InventoryForm from "./InventoryForm";
import { useNavigate, useParams } from "react-router";
import { fetchInventoryByIDService, updateStockService } from "./service";
import { inventoryMock } from "../../mocks/inventory";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ICommodity } from "../settings/commodity/interface";
import { StockRowData } from "../../components/forms/interface";
import { RequestContext } from "../../context/request/RequestContext";
import CommodityUtills from "../settings/commodity/utills";
import SupplierUtills from "../settings/suppliers/Utills";
import { ISupplier } from "../settings/suppliers/interface";
import { validateStockItems } from "../../utils/helpers";
import { toast } from "react-toastify";
import { brand, gold, neutral, border, surface, elevation, radii, status as statusTokens } from "../../utils/tokens";
import { ROUTES } from "../../core/routes/routes";
// Icons
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const PRIMARY_COLOR = brand[500];

/** Money display with thousands separators, e.g. 1234567 → "1,234,567.00". */
const fmtMoney = (n?: number) =>
    (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Compact stat card for the review totals. */
const TotalCard = ({ icon, label, value, tone }: {
    icon: ReactNode; label: string; value: string; tone: Record<number, string>;
}) => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: 1.75, bgcolor: '#fff', border: `1px solid ${border.subtle}`, borderRadius: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: alpha(tone[500], 0.1), color: tone[600], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: 20 } }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: neutral[900], lineHeight: 1.2 }}>{value}</Typography>
        </Box>
    </Box>
);

const UpdateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [defaultInventory, setDefaultInventory] = useState<any>(inventoryMock[0]);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const { id } = useParams<{ id: string }>();
    const { setStockRows, stockRows, totalCostPrice, totalPurchasePrice } = useContext(RequestContext);
    const { fetchAllCommodities } = CommodityUtills();
    const { addSupplierToStore } = SupplierUtills();
    const [formDataToSubmit, setFormDataToSubmit] = useState<IInventory | null>(null);
    // The stock's own supplier (full object) — kept so we can guarantee it's an autocomplete
    // option even if it falls outside the first page of suppliers the form loads.
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier | null>(null);
    // Wizard step: 0 = Order details, 1 = Stock items, 2 = Review & update.
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();

    const {
        control,
        formState,
        register,
        reset,
        trigger,
        watch,
        getValues
    } = useForm<IInventory>({ mode: 'onChange' });

    useEffect(() => { fetchAllCommodities() }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetchInventoryByIDService(id as string) as IInventoryAxiosResponse;
            if (response.status === 200) {
                const { data } = response;
                setCurrentSupplier((data.supplier as ISupplier) ?? null);
                setDefaultInventory({ ...data, supplier: data.supplier?.id });
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => { fetchInventory() }, [id])

    // Ensure the stock's supplier is present in the options so the autocomplete can resolve its
    // id to a name. Self-heals if the form's first-page fetch later replaces the list without it.
    useEffect(() => {
        if (
            currentSupplier?.id != null &&
            !suppliers.some((s: ISupplier) => String(s.id) === String(currentSupplier.id))
        ) {
            addSupplierToStore(currentSupplier);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSupplier, suppliers])

    const handleRows = () => {
        if (defaultInventory?.commodities && commodities?.length > 0) {
            const rowData = (defaultInventory.commodities as Array<{
                commodity: ICommodity,
                orderedQuantity: number,
                deliveredQuantity: number,
                costPrice: number,
                purchasePrice: number,
            }>).map((commodity, index) => ({
                id: Date.now() + index,
                assetTypeId: commodity.commodity.assetType?.id,
                name: commodity.commodity.name,
                groupName: commodity.commodity.groupName,
                orderedQuantity: commodity.orderedQuantity,
                deliveredQuantity: commodity.deliveredQuantity,
                commodityId: commodity.commodity.id,
                costPrice: commodity.costPrice,
                purchasePrice: commodity.purchasePrice
            })) as Array<StockRowData>;

            setStockRows(rowData);
        }
    }

    useEffect(() => {
        handleRows()
        reset({ ...defaultInventory });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultInventory]);

    // Order details → Items step. Update has no yup resolver, so validate the RHF-required fields.
    const handleNext = async () => {
        const valid = await trigger(['name', 'lpoNumber']);
        if (valid) setActiveStep(1);
    };

    // Items → Review: validate order details + stock lines, snapshot values, advance.
    const goToReview = async () => {
        const orderValid = await trigger(['name', 'lpoNumber']);
        if (!orderValid) {
            setActiveStep(0);
            toast.error('Please complete the order details first.');
            return;
        }
        const result = validateStockItems(stockRows);
        if (!result.isValid) {
            toast.error(`Please fix the stock items: ${result.errors[0] ?? ''}`);
            return;
        }
        setFormDataToSubmit(getValues());
        setActiveStep(2);
    };

    // Submit — a CORRECTION of the existing stock (header + commodity lines) via PUT /stocks/{id}.
    // Recording NEW deliveries is done from the Delivery Status panel ("Receive more"), not here.
    const onSubmit = async () => {
        if (!formDataToSubmit) return;

        setSendingRequest(true);

        const result = validateStockItems(stockRows);
        if (!result.isValid || !result.validData) {
            setSendingRequest(false);
            return toast.error(`Requests validation errors: ${result.errors}`)
        }

        // Accept both 'YYYY-MM-DD' (from the picker) and full ISO (from the fetched record).
        const toDateTime = (d?: string | null) => (d ? (d.includes('T') ? d : `${d}T00:00:00`) : null);

        try {
            const data = {
                stock: {
                    name: formDataToSubmit.name,
                    referenceNumber: formDataToSubmit.referenceNumber,
                    lpoNumber: formDataToSubmit.lpoNumber,
                    poNumber: formDataToSubmit.poNumber,
                    orderDate: toDateTime(formDataToSubmit.orderDate),
                    deliveryDate: toDateTime(formDataToSubmit.deliveryDate),
                    invoiceDate: toDateTime(formDataToSubmit.invoiceDate),
                    totalCost: totalCostPrice,
                    balanceCost: totalPurchasePrice,
                },
                supplier: formDataToSubmit.supplier,
                stockCommoditiesRequest: result.validData
            }

            const response = await updateStockService(data, id as string) as IInventoryAxiosResponse;
            if (response.status === 200 || response.status === 201) {
                toast.success("Inventory updated successfully");
                navigate(ROUTES.INVENTORY);
            } else {
                toast.error("Failed to update inventory. Please try again.");
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            setSendingRequest(false);
            return toast.error("Failed to update inventory. Please try again.");
        }

        setSendingRequest(false)
    };

    const getSupplierName = () => {
        const supplierId = formDataToSubmit?.supplier ?? defaultInventory?.supplier;
        if (supplierId == null) return currentSupplier?.name || '—';
        const match = suppliers.find((s: ISupplier) => String(s.id) === String(supplierId));
        return match?.name || currentSupplier?.name || '—';
    };

    const steps = ['Order details', 'Stock items', 'Review'];

    // ── Hero: live field checklist + completion ──
    const formValues = watch();
    const checklist = [
        { label: 'Name', done: Boolean(formValues.name) },
        { label: 'LPO Number', done: Boolean(formValues.lpoNumber) },
        { label: 'Supplier', done: Boolean(formValues.supplier) },
        { label: 'Delivery Date', done: Boolean(formValues.deliveryDate) },
        { label: 'Items', done: stockRows.some((r) => r.commodityId && (r.orderedQuantity || 0) > 0) },
    ];
    const doneCount = checklist.filter((c) => c.done).length;
    const formProgress = Math.round((doneCount / checklist.length) * 100);
    const isDone = formProgress === 100;

    const LIFECYCLE = [
        { label: 'Order Details', icon: <BusinessIcon sx={{ fontSize: 14 }} /> },
        { label: 'Stock Items', icon: <ListAltOutlinedIcon sx={{ fontSize: 14 }} /> },
        { label: 'Review & Update', icon: <RateReviewOutlinedIcon sx={{ fontSize: 14 }} /> },
        { label: 'Updated', icon: <Inventory2OutlinedIcon sx={{ fontSize: 14 }} /> },
    ];
    const lifecycleActiveIdx = activeStep;

    const primaryBtnSx = {
        height: 44,
        px: 3.5,
        borderRadius: `${radii.pill}px`,
        textTransform: 'none' as const,
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#fff',
        background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
        boxShadow: `0 6px 16px ${alpha(brand[500], 0.32)}`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
            background: `linear-gradient(135deg, ${brand[600]} 0%, ${brand[700]} 100%)`,
            boxShadow: `0 9px 22px ${alpha(brand[500], 0.42)}`,
            transform: 'translateY(-1px)',
        },
        '&.Mui-disabled': { background: alpha(brand[500], 0.5), color: '#fff', boxShadow: 'none' },
    };

    // ── Step 3: Review page ──
    const ReviewStep = () => {
        const fmtDate = (d?: string | null) =>
            d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

        const detailItems = [
            { label: 'LPO Number', value: formDataToSubmit?.lpoNumber || '—' },
            { label: 'PO Number', value: formDataToSubmit?.poNumber || '—' },
            { label: 'Inventory Name', value: formDataToSubmit?.name || '—' },
            { label: 'Supplier', value: getSupplierName() },
            { label: 'Order Date', value: fmtDate(formDataToSubmit?.orderDate) },
            { label: 'Delivery Date', value: fmtDate(formDataToSubmit?.deliveryDate) },
            { label: 'Invoice Date', value: fmtDate(formDataToSubmit?.invoiceDate) },
        ];

        const totalOrdered = stockRows.reduce((s, r) => s + (r.orderedQuantity || 0), 0);
        const totalDelivered = stockRows.reduce((s, r) => s + (r.deliveredQuantity || 0), 0);
        const grandTotal = stockRows.reduce((s, r) => s + (Number(r.purchasePrice) || 0) * (r.orderedQuantity || 0), 0);

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Order details */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: `1px solid ${border.subtle}` }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.09), color: brand[600], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BusinessIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: neutral[900] }}>Order Details</Typography>
                            <Typography variant="caption" sx={{ color: neutral[500] }}>Purchase order & supplier information</Typography>
                        </Box>
                    </Stack>
                    <Grid container sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
                        {detailItems.map((d) => (
                            <Grid item xs={12} sm={6} md={4} key={d.label}>
                                <Box sx={{ px: { xs: 1, md: 1.5 }, py: 1.25 }}>
                                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {d.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: d.value === '—' ? neutral[400] : neutral[900], mt: 0.25 }}>
                                        {d.value}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Requested items */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: `1px solid ${border.subtle}`, bgcolor: alpha(gold[500], 0.04) }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(gold[500], 0.14), color: gold[700], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <InventoryIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: neutral[900] }}>Requested Items</Typography>
                                <Typography variant="caption" sx={{ color: neutral[500] }}>Commodity lines on this stock entry</Typography>
                            </Box>
                        </Stack>
                        <Chip size="small" label={`${stockRows.length} item${stockRows.length === 1 ? '' : 's'}`} sx={{ fontWeight: 700, bgcolor: alpha(gold[500], 0.14), color: gold[700] }} />
                    </Stack>

                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 680 }}>
                            <TableHead>
                                <TableRow sx={{
                                    '& th': {
                                        bgcolor: alpha(brand[500], 0.04),
                                        borderBottom: `1px solid ${border.subtle}`,
                                        fontWeight: 700, fontSize: '0.68rem', color: brand[700],
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        py: 1.5, whiteSpace: 'nowrap',
                                    },
                                }}>
                                    <TableCell>Item</TableCell>
                                    <TableCell align="center">Ordered</TableCell>
                                    <TableCell align="center">Delivered</TableCell>
                                    <TableCell align="right">Unit Cost</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Line Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockRows.map((row, idx) => {
                                    const ordered = row.orderedQuantity || 0;
                                    const delivered = row.deliveredQuantity || 0;
                                    const purchase = Number(row.purchasePrice) || 0;
                                    const lineTotal = purchase * ordered;
                                    const deliveredTone = delivered === 0
                                        ? statusTokens.danger
                                        : delivered >= ordered ? statusTokens.success : statusTokens.warning;
                                    return (
                                        <TableRow
                                            key={row.id ?? idx}
                                            sx={{
                                                '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.015) },
                                                '&:hover': { bgcolor: alpha(brand[500], 0.04) },
                                                transition: 'background 0.15s',
                                                '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.85 },
                                            }}
                                        >
                                            {/* Item */}
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{ width: 30, height: 30, borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: brand[700], bgcolor: alpha(brand[500], 0.1) }}>
                                                        {idx + 1}
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                                                            {row.name || '—'}
                                                        </Typography>
                                                        {row.groupName && (
                                                            <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>{row.groupName}</Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            {/* Ordered */}
                                            <TableCell align="center">
                                                <Box component="span" sx={{ display: 'inline-flex', minWidth: 34, justifyContent: 'center', px: 1, py: 0.4, borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: neutral[700], bgcolor: alpha(neutral[900], 0.05) }}>
                                                    {ordered}
                                                </Box>
                                            </TableCell>
                                            {/* Delivered */}
                                            <TableCell align="center">
                                                <Box component="span" sx={{ display: 'inline-flex', minWidth: 34, justifyContent: 'center', px: 1, py: 0.4, borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: deliveredTone.strong, bgcolor: deliveredTone.soft }}>
                                                    {delivered}
                                                </Box>
                                            </TableCell>
                                            {/* Unit cost */}
                                            <TableCell align="right" sx={{ fontSize: '0.85rem', color: neutral[700], fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(Number(row.costPrice) || 0)}</TableCell>
                                            {/* Unit price */}
                                            <TableCell align="right" sx={{ fontSize: '0.85rem', color: neutral[700], fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(purchase)}</TableCell>
                                            {/* Line total */}
                                            <TableCell align="right">
                                                <Box component="span" sx={{ display: 'inline-block', px: 1.25, py: 0.45, borderRadius: '8px', bgcolor: alpha(brand[500], 0.08), color: brand[700], fontWeight: 800, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                                                    {fmtMoney(lineTotal)}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow sx={{ '& td': { borderTop: `2px solid ${border.subtle}`, borderBottom: 'none', py: 1.75, bgcolor: alpha(brand[500], 0.02) } }}>
                                    <TableCell sx={{ fontWeight: 800, color: neutral[700], fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 800, color: neutral[800], fontSize: '0.85rem' }}>{totalOrdered}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 800, color: neutral[800], fontSize: '0.85rem' }}>{totalDelivered}</TableCell>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell align="right">
                                        <Typography sx={{ fontWeight: 800, color: brand[700], fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
                                            {fmtMoney(grandTotal)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Totals */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TotalCard icon={<PaidOutlinedIcon />} label="Total Cost" value={fmtMoney(totalCostPrice)} tone={brand} />
                    <TotalCard icon={<SellOutlinedIcon />} label="Total Purchase Price" value={fmtMoney(totalPurchasePrice)} tone={gold} />
                </Stack>

                {/* Notice */}
                <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ p: 1.75, borderRadius: 2, bgcolor: alpha(gold[500], 0.07), border: `1px solid ${alpha(gold[500], 0.25)}` }}>
                    <WarningAmberIcon sx={{ fontSize: 18, color: gold[700], mt: 0.1, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.82rem', color: neutral[700], lineHeight: 1.5 }}>
                        This corrects the existing stock record. To record a new delivery instead, use “Receive more” on the stock's Delivery Status.
                    </Typography>
                </Stack>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page header card ── */}
            <Box sx={{ borderRadius: `${radii.lg}px`, border: `1px solid ${border.subtle}`, bgcolor: surface.card, overflow: 'hidden', boxShadow: elevation.card }}>
                {/* Title row */}
                <Box sx={{
                    px: { xs: 2.5, sm: 3.5 }, py: 2.5,
                    display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2,
                }}>
                    {/* Left — icon + title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha(PRIMARY_COLOR, 0.08), border: `1px solid ${alpha(PRIMARY_COLOR, 0.18)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <EditOutlinedIcon sx={{ fontSize: 22, color: brand[600] }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                Update Stock
                            </Typography>
                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
                                Correct the order details and commodity lines for {defaultInventory?.name || defaultInventory?.lpoNumber || 'this stock entry'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right — live field checklist */}
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Completion
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: isDone ? statusTokens.success.strong : brand[700] }}>
                                {formProgress}%
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            {checklist.map((item) => (
                                <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}
                                    sx={{
                                        px: 1, py: 0.4, borderRadius: `${radii.pill}px`,
                                        border: `1px solid ${item.done ? alpha(PRIMARY_COLOR, 0.35) : border.default}`,
                                        bgcolor: item.done ? alpha(PRIMARY_COLOR, 0.07) : 'transparent',
                                        transition: 'all 0.25s ease',
                                    }}>
                                    {item.done ? (
                                        <CheckRoundedIcon sx={{ fontSize: 12, color: brand[600] }} />
                                    ) : (
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: neutral[300], mx: '3px' }} />
                                    )}
                                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: item.done ? brand[700] : neutral[500] }}>
                                        {item.label}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Lifecycle rail */}
                <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 1.5, borderTop: `1px solid ${border.subtle}`, bgcolor: surface.muted, overflowX: 'auto' }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 'max-content' }}>
                        {LIFECYCLE.map((step, idx) => {
                            const state = idx < lifecycleActiveIdx ? 'done' : idx === lifecycleActiveIdx ? 'active' : 'todo';
                            return (
                                <Stack key={step.label} direction="row" alignItems="center" spacing={1}>
                                    {idx > 0 && <ArrowForwardIosRoundedIcon sx={{ fontSize: 10, color: neutral[300] }} />}
                                    <Stack direction="row" alignItems="center" spacing={0.75}
                                        sx={{
                                            px: 1.25, py: 0.5, borderRadius: `${radii.pill}px`, transition: 'all 0.25s ease',
                                            ...(state === 'active' && { bgcolor: PRIMARY_COLOR, color: '#fff' }),
                                            ...(state === 'done' && { bgcolor: alpha(PRIMARY_COLOR, 0.08), color: brand[700] }),
                                            ...(state === 'todo' && { color: neutral[400] }),
                                        }}>
                                        <Box sx={{ display: 'flex', color: 'inherit' }}>
                                            {state === 'done' ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : step.icon}
                                        </Box>
                                        <Typography sx={{ fontSize: '0.72rem', fontWeight: state === 'active' ? 700 : 600, color: 'inherit', whiteSpace: 'nowrap' }}>
                                            {step.label}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>

            {/* Navigation is driven by explicit button clicks, not native submit. */}
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
                            <InventoryForm
                                handleClose={() => { }}
                                buttonText="Submit"
                                formState={formState}
                                control={control}
                                sendingRequest={sendingRequest}
                                register={register}
                                section="details"
                                hideSubmitBar
                            />
                        </Box>
                        <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
                            <InventoryForm
                                handleClose={() => { }}
                                buttonText="Submit"
                                formState={formState}
                                control={control}
                                sendingRequest={sendingRequest}
                                register={register}
                                section="items"
                                hideSubmitBar
                            />
                        </Box>
                        {activeStep === 2 && <ReviewStep />}
                    </Grid>
                </Grid>

                {/* Wizard navigation — action bar */}
                <Paper elevation={0} sx={{ mt: 2.5, p: { xs: 2, md: 2.5 }, borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                        {/* Left — step context */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: brand[700], bgcolor: alpha(PRIMARY_COLOR, 0.1) }}>
                                {activeStep + 1}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: neutral[800], lineHeight: 1.2 }}>
                                    {steps[activeStep]}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>
                                    Step {activeStep + 1} of 3 · {activeStep === 0
                                        ? 'Order & delivery details'
                                        : activeStep === 1
                                            ? 'Correct the commodity lines'
                                            : 'Confirm & update'}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Right — actions */}
                        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            <MuiButton
                                type="button"
                                variant="outlined"
                                disabled={sendingRequest}
                                onClick={() => (activeStep === 0 ? navigate(ROUTES.INVENTORY) : setActiveStep(activeStep - 1))}
                                startIcon={activeStep === 0 ? <CloseRoundedIcon /> : <ArrowBackRoundedIcon />}
                                sx={{ height: 44, px: 2.75, borderRadius: `${radii.pill}px`, textTransform: 'none', fontWeight: 600, borderColor: border.default, color: neutral[600], '&:hover': { borderColor: neutral[400], bgcolor: neutral[50], color: neutral[800] } }}
                            >
                                {activeStep === 0 ? 'Cancel' : 'Back'}
                            </MuiButton>

                            {activeStep === 0 && (
                                <MuiButton type="button" onClick={handleNext} endIcon={<ArrowForwardRoundedIcon />} sx={primaryBtnSx}>
                                    Next: Stock items
                                </MuiButton>
                            )}
                            {activeStep === 1 && (
                                <MuiButton type="button" onClick={goToReview} endIcon={<ArrowForwardRoundedIcon />} sx={primaryBtnSx}>
                                    Next: Review
                                </MuiButton>
                            )}
                            {activeStep === 2 && (
                                <MuiButton
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={sendingRequest}
                                    startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleOutlineIcon fontSize="small" />}
                                    sx={primaryBtnSx}
                                >
                                    {sendingRequest ? 'Updating…' : 'Confirm & Update'}
                                </MuiButton>
                            )}
                        </Stack>
                    </Stack>
                </Paper>
            </form>
        </Box>
    );
};

export default UpdateInventory;
