/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Box,
    Typography,
    alpha,
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
    TableFooter
} from "@mui/material"
import { IInventory, IInventoryAxiosResponse } from "./interface"
import { useContext, useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryForm from "./InventoryForm";
import { RequestContext } from "../../context/request/RequestContext";
import { toast } from "react-toastify";
import { validateStockItems } from "../../utils/helpers";
import { addStockService } from "./service";
import { brand, gold, neutral, border, surface, elevation, radii, status as statusTokens } from "../../utils/tokens";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSelector } from "react-redux";
import { ISupplier } from "../settings/suppliers/interface";
import { RootState } from "../../store";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// Brand colors
const PRIMARY_COLOR = brand[500];

/** Money display with thousands separators, e.g. 1234567 → "1,234,567.00". */
const fmtMoney = (n?: number) =>
    (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Currency shown across the review summary. */
const CURRENCY = 'UGX';

const CreateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { stockRows, totalCostPrice, totalPurchasePrice } = useContext(RequestContext);
    const defaultInventory: IInventory = {} as IInventory;
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    // Snapshot of the form values captured when entering the Review step; also the payload source.
    const [formDataToSubmit, setFormDataToSubmit] = useState<IInventory | null>(null);
    // Stable per-submission key so a network retry (or an accidental double click that
    // slips past the disabled button) can never create a duplicate stock + duplicate assets.
    const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
    const navigate = useNavigate();

    // Wizard step: 0 = Order details, 1 = Stock items, 2 = Review & submit.
    const [activeStep, setActiveStep] = useState(0);

    const {
        control,
        formState,
        register,
        reset,
        trigger,
        watch,
        getValues
    } = useForm<IInventory>({
        mode: 'onChange',
        // Cast: the schema's inferred type is narrower than IInventory (deliveryDate is
        // optional/nullable on the model but required at create time).
        resolver: yupResolver(inventorySchema) as unknown as Resolver<IInventory>,
    });

    useEffect(() => {
        reset({ ...defaultInventory });
    }, [reset]);

    // Step 1 → 2: validate the order-detail fields before advancing to the items step.
    const handleNext = async () => {
        const valid = await trigger(['name', 'lpoNumber', 'deliveryDate']);
        if (valid) setActiveStep(1);
    };

    // Items step → Review: re-checks the order details, then the stock lines, then snapshots the
    // form values and advances to the Review page. Navigation never goes through native form
    // submit, so an Enter keypress can't trigger item validation early.
    const goToReview = async () => {
        const orderValid = await trigger(['name', 'lpoNumber', 'deliveryDate']);
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

    const steps = ['Order details', 'Stock items', 'Review'];

    // ── Hero: live field checklist + completion (mirrors the Create Request hero) ──
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

    // Lifecycle rail — advances with the wizard step; the Review step is the confirm modal.
    const LIFECYCLE = [
        { label: 'Order Details', icon: <BusinessIcon sx={{ fontSize: 14 }} /> },
        { label: 'Stock Items', icon: <ListAltOutlinedIcon sx={{ fontSize: 14 }} /> },
        { label: 'Review & Submit', icon: <RateReviewOutlinedIcon sx={{ fontSize: 14 }} /> },
        { label: 'Stocked', icon: <Inventory2OutlinedIcon sx={{ fontSize: 14 }} /> },
    ];
    const lifecycleActiveIdx = activeStep;

    // Shared style for the footer's primary CTA — gradient fill + lift-on-hover.
    const primaryBtnSx = {
        height: 44,
        px: 3.5,
        borderRadius: '8px',
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

    // Handle actual submission from the Review step.
    const onSubmit = async () => {
        if (!formDataToSubmit) return;

        setSendingRequest(true);

        const result = validateStockItems(stockRows);

        if (result.isValid && result.validData) {
            // NOTE: `status` and `grnNumber` are intentionally omitted — both are
            // authoritative on the server (status is derived from delivered vs ordered,
            // the GRN number is issued from a server sequence).
            // Date pickers emit 'YYYY-MM-DD'; the backend fields are LocalDateTime, so pin to a
            // start-of-day ISO datetime. Accept a full ISO value too, just in case.
            const toDateTime = (d?: string | null) => (d ? (d.includes('T') ? d : `${d}T00:00:00`) : null);

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
                    balanceCost: totalPurchasePrice
                },
                idempotencyKey,
                supplier: formDataToSubmit.supplier,
                stockCommoditiesRequest: result.validData
            }

            try {
                const response = await addStockService(data) as IInventoryAxiosResponse;
                if (response.status === 201 || response.status === 200) {
                    toast.success("Stock created successfully");
                    navigate(ROUTES.INVENTORY);
                }
            } catch (error) {
                console.log(error)
                toast.error("Failed to create inventory");
            }

        } else {
            toast.error(`Requests validation errors: ${result.errors}`)
        }
        setSendingRequest(false);
    }

    const getSupplierName = () => {
        if (!formDataToSubmit?.supplier) return "Not specified";

        const supplier = suppliers.find((s: ISupplier) => s.id === formDataToSubmit.supplier);
        return supplier?.name || "Not specified";
    };

    // ── Step 3: Review page — a full, spacious summary shown before submit ──
    const ReviewStep = () => {
        const fmtDate = (d?: string | null) =>
            d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

        const totalOrdered = stockRows.reduce((s, r) => s + (r.orderedQuantity || 0), 0);
        const totalDelivered = stockRows.reduce((s, r) => s + (r.deliveredQuantity || 0), 0);
        const grandTotal = stockRows.reduce((s, r) => s + (Number(r.purchasePrice) || 0) * (r.orderedQuantity || 0), 0);

        const supplierName = getSupplierName();
        const hasSupplier = supplierName !== 'Not specified';

        // Split into two logical groups — who/what the order is, and when it happens.
        const references = [
            { label: 'Inventory name', value: formDataToSubmit?.name },
            { label: 'LPO number', value: formDataToSubmit?.lpoNumber },
            { label: 'PO number', value: formDataToSubmit?.poNumber },
            { label: 'Supplier', value: hasSupplier ? supplierName : '' },
        ];
        const schedule = [
            { label: 'Order date', value: fmtDate(formDataToSubmit?.orderDate) },
            { label: 'Delivery date', value: fmtDate(formDataToSubmit?.deliveryDate) },
            { label: 'Invoice date', value: fmtDate(formDataToSubmit?.invoiceDate) },
        ];

        /** One label/value line. A missing value stays muted so the eye skips straight past it. */
        const Field = ({ label, value }: { label: string; value?: string | null }) => (
            <Stack
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                spacing={2}
                sx={{
                    py: 1.35,
                    borderBottom: `1px dashed ${border.subtle}`,
                    '&:last-of-type': { borderBottom: 'none' },
                }}
            >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: neutral[500], whiteSpace: 'nowrap' }}>
                    {label}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        fontWeight: value ? 700 : 500,
                        color: value ? neutral[900] : neutral[400],
                        fontStyle: value ? 'normal' : 'italic',
                        textAlign: 'right',
                        wordBreak: 'break-word',
                    }}
                >
                    {value || 'Not provided'}
                </Typography>
            </Stack>
        );

        const GroupLabel = ({ children }: { children: string }) => (
            <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.75 }}>
                {children}
            </Typography>
        );

        const headCellSx = {
            bgcolor: surface.muted,
            borderBottom: `1px solid ${border.subtle}`,
            fontWeight: 700,
            fontSize: '0.68rem',
            color: neutral[500],
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            py: 1.5,
            whiteSpace: 'nowrap',
        } as const;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* ── Commitment banner — what this entry is, and what it's worth ── */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems="stretch">
                        <Box sx={{ flex: 1, minWidth: 0, px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 } }}>
                            <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Stock entry
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.45rem' }, fontWeight: 800, color: neutral[900], lineHeight: 1.25, mt: 0.75, wordBreak: 'break-word' }}>
                                {formDataToSubmit?.name || 'Untitled stock'}
                            </Typography>
                            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                                <Box sx={{ px: 1, py: 0.4, borderRadius: '6px', bgcolor: alpha(brand[500], 0.08), color: brand[700], fontSize: '0.75rem', fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                                    LPO {formDataToSubmit?.lpoNumber || '—'}
                                </Box>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: hasSupplier ? neutral[700] : neutral[400], fontStyle: hasSupplier ? 'normal' : 'italic' }}>
                                    {hasSupplier ? supplierName : 'No supplier recorded'}
                                </Typography>
                            </Stack>
                        </Box>

                        <Box
                            sx={{
                                px: { xs: 2.5, md: 3 },
                                py: { xs: 2.5, md: 3 },
                                minWidth: { md: 300 },
                                bgcolor: alpha(brand[500], 0.025),
                                borderTop: { xs: `1px solid ${border.subtle}`, md: 'none' },
                                borderLeft: { xs: 'none', md: `1px solid ${border.subtle}` },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: brand[700], textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Total value
                            </Typography>
                            <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.75 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: brand[600] }}>{CURRENCY}</Typography>
                                <Typography sx={{ fontSize: { xs: '1.5rem', md: '1.7rem' }, fontWeight: 800, color: neutral[900], lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                                    {fmtMoney(grandTotal)}
                                </Typography>
                            </Stack>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: neutral[500], mt: 1 }}>
                                {stockRows.length} item{stockRows.length === 1 ? '' : 's'} · {totalOrdered} unit{totalOrdered === 1 ? '' : 's'} ordered
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* ── Order details — grouped as references vs schedule ── */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: { xs: 2.5, md: 3 }, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                        <BusinessIcon sx={{ fontSize: 18, color: neutral[400] }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: neutral[900] }}>Order details</Typography>
                    </Stack>
                    <Grid container>
                        <Grid item xs={12} md={6} sx={{ px: { xs: 2.5, md: 3 }, py: 2.25, borderRight: { md: `1px solid ${border.subtle}` }, borderBottom: { xs: `1px solid ${border.subtle}`, md: 'none' } }}>
                            <GroupLabel>References</GroupLabel>
                            {references.map((f) => <Field key={f.label} label={f.label} value={f.value} />)}
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ px: { xs: 2.5, md: 3 }, py: 2.25 }}>
                            <GroupLabel>Schedule</GroupLabel>
                            {schedule.map((f) => <Field key={f.label} label={f.label} value={f.value} />)}
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── Items — fulfilment-aware line list ── */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.25} sx={{ px: { xs: 2.5, md: 3 }, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            <InventoryIcon sx={{ fontSize: 18, color: neutral[400] }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: neutral[900] }}>Items</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: neutral[500] }}>
                            {totalDelivered} of {totalOrdered} units received
                        </Typography>
                    </Stack>

                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 760 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ ...headCellSx, pl: { xs: 2.5, md: 3 } }}>Item</TableCell>
                                    <TableCell align="center" sx={headCellSx}>Delivered / Ordered</TableCell>
                                    <TableCell align="right" sx={headCellSx}>Unit cost</TableCell>
                                    <TableCell align="right" sx={headCellSx}>Unit price</TableCell>
                                    <TableCell align="right" sx={{ ...headCellSx, pr: { xs: 2.5, md: 3 } }}>Line total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockRows.map((row, idx) => {
                                    const ordered = row.orderedQuantity || 0;
                                    const delivered = row.deliveredQuantity || 0;
                                    const purchase = Number(row.purchasePrice) || 0;
                                    const lineTotal = purchase * ordered;
                                    const pct = ordered > 0 ? Math.min(100, Math.round((delivered / ordered) * 100)) : 0;
                                    const tone = delivered === 0
                                        ? statusTokens.danger
                                        : delivered >= ordered ? statusTokens.success : statusTokens.warning;
                                    return (
                                        <TableRow
                                            key={row.id ?? idx}
                                            sx={{
                                                '&:hover': { bgcolor: surface.muted },
                                                transition: 'background 0.15s',
                                                '& td': { borderBottom: `1px solid ${border.subtle}`, py: 1.85 },
                                            }}
                                        >
                                            {/* Item */}
                                            <TableCell sx={{ pl: { xs: 2.5, md: 3 } }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: neutral[300], minWidth: 14, fontVariantNumeric: 'tabular-nums' }}>
                                                        {idx + 1}
                                                    </Typography>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: neutral[900], lineHeight: 1.35 }}>
                                                            {row.name || '—'}
                                                        </Typography>
                                                        {row.groupName && (
                                                            <Typography sx={{ fontSize: '0.72rem', color: neutral[500], mt: 0.15 }}>
                                                                {row.groupName}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            {/* Fulfilment — figure plus a bar, so partial deliveries read at a glance */}
                                            <TableCell align="center">
                                                <Box sx={{ display: 'inline-block', minWidth: 96 }}>
                                                    <Stack direction="row" spacing={0.5} alignItems="baseline" justifyContent="center">
                                                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: tone.strong, fontVariantNumeric: 'tabular-nums' }}>
                                                            {delivered}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: neutral[400], fontVariantNumeric: 'tabular-nums' }}>
                                                            / {ordered}
                                                        </Typography>
                                                    </Stack>
                                                    <Box sx={{ mt: 0.6, height: 4, borderRadius: 999, bgcolor: alpha(neutral[900], 0.07), overflow: 'hidden' }}>
                                                        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 999, bgcolor: tone.main }} />
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontSize: '0.875rem', color: neutral[700], fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtMoney(Number(row.costPrice) || 0)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: '0.875rem', color: neutral[700], fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtMoney(purchase)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: { xs: 2.5, md: 3 }, fontSize: '0.9rem', fontWeight: 800, color: neutral[900], fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtMoney(lineTotal)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow sx={{ '& td': { borderBottom: 'none', py: 2, bgcolor: alpha(brand[500], 0.03) } }}>
                                    <TableCell sx={{ pl: { xs: 2.5, md: 3 }, fontWeight: 800, color: neutral[700], fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                        Total
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 800, color: neutral[800], fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                                        {totalDelivered} / {totalOrdered}
                                    </TableCell>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell align="right" sx={{ pr: { xs: 2.5, md: 3 } }}>
                                        <Stack direction="row" alignItems="baseline" spacing={0.6} justifyContent="flex-end">
                                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: brand[600] }}>{CURRENCY}</Typography>
                                            <Typography sx={{ fontWeight: 800, color: brand[700], fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                                                {fmtMoney(grandTotal)}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* ── What happens on submit ── */}
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(gold[500], 0.35)}`, bgcolor: alpha(gold[500], 0.05), px: { xs: 2.5, md: 3 }, py: 2.25 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                        <WarningAmberIcon sx={{ fontSize: 18, color: gold[700] }} />
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: neutral[900] }}>Before you submit</Typography>
                    </Stack>
                    <Stack component="ul" spacing={0.85} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                        {[
                            'A GRN number is issued automatically once the entry is saved.',
                            'Delivered quantities are credited to the store and registered against tracked asset types.',
                            'Submitted entries cannot be easily modified — corrections go through a separate flow.',
                        ].map((line) => (
                            <Stack key={line} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: gold[600], mt: '7px', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: '0.84rem', color: neutral[700], lineHeight: 1.55 }}>{line}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2.5, sm: 3.5, md: 4 },
                minHeight: '100vh',
                bgcolor: '#f8fafc',
            }}
        >
            {/* ── Page header card (matches the Create Request hero) ── */}
            <Box
                sx={{
                    borderRadius: 2.5,
                    border: `1px solid ${border.subtle}`,
                    bgcolor: '#fff',
                    overflow: 'hidden',
                    boxShadow: `0 2px 8px ${alpha('#000', 0.06)}`,
                }}
            >
                {/* Title row */}
                <Box sx={{
                    px: { xs: 3, sm: 4, md: 4.5 },
                    py: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 3,
                    background: `linear-gradient(135deg, ${alpha(brand[500], 0.01)} 0%, transparent 100%)`,
                }}>
                    {/* Left — icon + title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                        <Box sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.18)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Inventory2Icon sx={{ fontSize: 22, color: brand[600] }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                                Create New Stock
                            </Typography>
                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
                                Record a new delivery of stock items into inventory
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right — live field checklist */}
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ mb: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
                        >
                            <Typography sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: neutral[400],
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}>
                                Completion
                            </Typography>
                            <Typography sx={{
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                fontVariantNumeric: 'tabular-nums',
                                color: isDone ? statusTokens.success.strong : brand[700],
                            }}>
                                {formProgress}%
                            </Typography>
                            {isDone && (
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: statusTokens.success.strong }}>
                                    · Ready to submit
                                </Typography>
                            )}
                        </Stack>

                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            {checklist.map((item) => (
                                <Stack
                                    key={item.label}
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{
                                        px: 1,
                                        py: 0.4,
                                        borderRadius: `${radii.pill}px`,
                                        border: `1px solid ${item.done ? alpha(PRIMARY_COLOR, 0.35) : border.default}`,
                                        bgcolor: item.done ? alpha(PRIMARY_COLOR, 0.07) : 'transparent',
                                        transition: 'all 0.25s ease',
                                    }}
                                >
                                    {item.done ? (
                                        <CheckRoundedIcon sx={{ fontSize: 12, color: brand[600] }} />
                                    ) : (
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: neutral[300], mx: '3px' }} />
                                    )}
                                    <Typography sx={{
                                        fontSize: '0.68rem',
                                        fontWeight: 600,
                                        color: item.done ? brand[700] : neutral[500],
                                    }}>
                                        {item.label}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Lifecycle rail — advances with the wizard step */}
                <Box sx={{
                    px: { xs: 3, sm: 4, md: 4.5 },
                    py: 2,
                    borderTop: `1px solid ${border.subtle}`,
                    bgcolor: alpha(brand[500], 0.015),
                    overflowX: 'auto',
                }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 'max-content' }}>
                        {LIFECYCLE.map((step, idx) => {
                            const state = idx < lifecycleActiveIdx ? 'done' : idx === lifecycleActiveIdx ? 'active' : 'todo';
                            return (
                                <Stack key={step.label} direction="row" alignItems="center" spacing={1}>
                                    {idx > 0 && (
                                        <ArrowForwardIosRoundedIcon sx={{ fontSize: 10, color: neutral[300] }} />
                                    )}
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.75}
                                        sx={{
                                            px: 1.25,
                                            py: 0.5,
                                            borderRadius: `${radii.pill}px`,
                                            transition: 'all 0.25s ease',
                                            ...(state === 'active' && { bgcolor: PRIMARY_COLOR, color: '#fff' }),
                                            ...(state === 'done' && { bgcolor: alpha(PRIMARY_COLOR, 0.08), color: brand[700] }),
                                            ...(state === 'todo' && { color: neutral[400] }),
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', color: 'inherit' }}>
                                            {state === 'done' ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : step.icon}
                                        </Box>
                                        <Typography sx={{
                                            fontSize: '0.72rem',
                                            fontWeight: state === 'active' ? 700 : 600,
                                            color: 'inherit',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {step.label}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>

            {/* Navigation is driven by explicit button clicks, not native submit — preventDefault
                stops an Enter keypress from submitting/validating prematurely. */}
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {/* Steps 0 & 1 stay mounted (display-toggled) so RHF + stock rows keep their
                            state as the user moves between steps. */}
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
                <Paper
                    elevation={0}
                    sx={{
                        mt: 4,
                        p: { xs: 3, md: 3.5 },
                        borderRadius: 2.5,
                        border: `1px solid ${border.subtle}`,
                        bgcolor: '#fff',
                        boxShadow: `0 2px 8px ${alpha('#000', 0.05)}`,
                        background: `linear-gradient(135deg, ${alpha(brand[500], 0.008)} 0%, transparent 100%)`,
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        {/* Left — step context */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: brand[700],
                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            }}>
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
                                            ? 'Items received in this delivery'
                                            : 'Confirm & submit'}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Right — actions */}
                        <Stack
                            direction={{ xs: 'column-reverse', sm: 'row' }}
                            spacing={1.25}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            <MuiButton
                                type="button"
                                variant="outlined"
                                disabled={sendingRequest}
                                onClick={() => (activeStep === 0 ? navigate(ROUTES.INVENTORY) : setActiveStep(activeStep - 1))}
                                startIcon={activeStep === 0 ? <CloseRoundedIcon /> : <ArrowBackRoundedIcon />}
                                sx={{
                                    height: 44,
                                    px: 2.75,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: border.default,
                                    color: neutral[600],
                                    '&:hover': { borderColor: neutral[400], bgcolor: neutral[50], color: neutral[800] },
                                }}
                            >
                                {activeStep === 0 ? 'Cancel' : 'Back'}
                            </MuiButton>

                            {activeStep === 0 && (
                                <MuiButton
                                    type="button"
                                    onClick={handleNext}
                                    endIcon={<ArrowForwardRoundedIcon />}
                                    sx={primaryBtnSx}
                                >
                                    Next: Stock items
                                </MuiButton>
                            )}
                            {activeStep === 1 && (
                                <MuiButton
                                    type="button"
                                    onClick={goToReview}
                                    endIcon={<ArrowForwardRoundedIcon />}
                                    sx={primaryBtnSx}
                                >
                                    Next: Review
                                </MuiButton>
                            )}
                            {activeStep === 2 && (
                                <MuiButton
                                    type="button"
                                    onClick={onSubmit}
                                    disabled={sendingRequest}
                                    startIcon={sendingRequest
                                        ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                                        : <CheckCircleOutlineIcon fontSize="small" />}
                                    sx={primaryBtnSx}
                                >
                                    {sendingRequest ? 'Submitting…' : 'Confirm & Submit'}
                                </MuiButton>
                            )}
                        </Stack>
                    </Stack>
                </Paper>
            </form>
        </Box>
    )
}

export default CreateInventory