/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Breadcrumbs,
    Typography,
    alpha,
    Chip,
    Link,
    Stack,
    IconButton,
    Fade,
    Button as MuiButton,
    CircularProgress
} from "@mui/material"
import { IInventory, IInventoryAxiosResponse } from "./interface"
import { ReactNode, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryForm from "./InventoryForm";
import { RequestContext } from "../../context/request/RequestContext";
import { toast } from "react-toastify";
import { generateReferenceNumber, validateStockItems } from "../../utils/helpers";
import { addStockService } from "./service";
import { brand, gold, neutral, border, surface } from "../../utils/tokens";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSelector } from "react-redux";
import { ISupplier } from "../settings/suppliers/interface";
import { RootState } from "../../store";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';

// Brand colors
const PRIMARY_COLOR = brand[500];

/** Money display with thousands separators, e.g. 1234567 → "1,234,567.00". */
const fmtMoney = (n?: number) =>
    (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Compact stat card for the confirmation totals (Total Cost / Total Purchase Price). */
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

const CreateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { stockRows, totalCostPrice, totalPurchasePrice } = useContext(RequestContext);
    const defaultInventory: IInventory = {} as IInventory;
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    // Add confirmation modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState<IInventory | null>(null);
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IInventory>({
        mode: 'onChange',
        resolver: yupResolver(inventorySchema),
    });

    useEffect(() => {
        reset({ ...defaultInventory });
    }, [reset]);

    // Intercept form submission to show confirmation modal
    const handleFormPreSubmit = (formData: IInventory) => {
        setFormDataToSubmit(formData);
        setConfirmModalOpen(true);
    };

    // Handle actual submission after confirmation
    const onSubmit = async () => {
        if (!formDataToSubmit) return;

        setSendingRequest(true);
        setConfirmModalOpen(false);

        const result = validateStockItems(stockRows);

        if (result.isValid && result.validData) {
            const data = {
                stock: {
                    name: formDataToSubmit.name,
                    referenceNumber: formDataToSubmit.referenceNumber,
                    lpoNumber: formDataToSubmit.lpoNumber,
                    grnNumber: generateReferenceNumber(),
                    totalCost: totalCostPrice,
                    balanceCost: totalPurchasePrice
                },
                status: 1,
                supplier: formDataToSubmit.supplier,
                stockCommoditiesRequest: result.validData
            }

            try {
                const response = await addStockService(data) as IInventoryAxiosResponse;
                if (response.status === 201) {
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

    const ConfirmationModal = () => {
        const infoRows = [
            { label: 'LPO Number', value: formDataToSubmit?.lpoNumber || 'Not specified' },
            { label: 'Inventory Name', value: formDataToSubmit?.name || 'Not specified' },
            { label: 'Supplier', value: getSupplierName() },
        ];

        return (
            <Dialog
                open={confirmModalOpen}
                onClose={() => !sendingRequest && setConfirmModalOpen(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{ elevation: 0, sx: { borderRadius: 3, border: `1px solid ${border.subtle}`, overflow: 'hidden' } }}
            >
                {/* Header */}
                <Box
                    sx={{
                        position: 'relative', px: 3, pt: 2.75, pb: 2.25,
                        borderBottom: `1px solid ${border.subtle}`,
                        background: `linear-gradient(135deg, ${alpha(brand[50], 0.7)} 0%, #fff 65%)`,
                    }}
                >
                    <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${brand[500]}, ${brand[700]})` }} />
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(brand[500], 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircleOutlineIcon sx={{ color: brand[600], fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: neutral[900], lineHeight: 1.2 }}>
                                    Confirm Inventory Submission
                                </Typography>
                                <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>
                                    Review the details below before creating this stock entry
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={() => setConfirmModalOpen(false)} aria-label="close" size="small" disabled={sendingRequest} sx={{ color: neutral[400] }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>

                <DialogContent sx={{ p: 3, bgcolor: surface.page }}>
                    {/* LPO information */}
                    <Box sx={{ bgcolor: '#fff', border: `1px solid ${border.subtle}`, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${border.subtle}` }}>
                            <BusinessIcon sx={{ fontSize: 18, color: brand[600] }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: neutral[600], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                LPO Information
                            </Typography>
                        </Stack>
                        <Box sx={{ px: 2, py: 0.5 }}>
                            {infoRows.map((r, i) => (
                                <Stack
                                    key={r.label}
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={2}
                                    sx={{ py: 1.15, borderBottom: i < infoRows.length - 1 ? `1px solid ${alpha(neutral[900], 0.05)}` : 'none' }}
                                >
                                    <Typography sx={{ fontSize: '0.82rem', color: neutral[500], fontWeight: 500, flexShrink: 0 }}>{r.label}</Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: neutral[900], fontWeight: 600, textAlign: 'right' }}>{r.value}</Typography>
                                </Stack>
                            ))}
                        </Box>
                    </Box>

                    {/* Stock items */}
                    <Box sx={{ bgcolor: '#fff', border: `1px solid ${border.subtle}`, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${border.subtle}` }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <InventoryIcon sx={{ fontSize: 18, color: gold[500] }} />
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: neutral[600], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Stock Items
                                </Typography>
                            </Stack>
                            <Chip size="small" label={stockRows.length} sx={{ height: 20, minWidth: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(gold[500], 0.12), color: gold[700] }} />
                        </Stack>
                        {stockRows.length > 0 ? (
                            <Box sx={{ maxHeight: 210, overflowY: 'auto' }}>
                                {stockRows.map((item, idx) => (
                                    <Stack
                                        key={`item-${idx}`}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={1.5}
                                        sx={{ px: 2, py: 1.15, borderBottom: idx < stockRows.length - 1 ? `1px solid ${alpha(neutral[900], 0.05)}` : 'none' }}
                                    >
                                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: alpha(brand[500], 0.08), color: brand[700], fontSize: '0.66rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {idx + 1}
                                            </Box>
                                            <Typography noWrap sx={{ fontSize: '0.85rem', color: neutral[800], fontWeight: 600 }}>
                                                {item.name || 'Unknown item'}
                                            </Typography>
                                        </Stack>
                                        <Chip size="small" label={`Qty: ${item.orderedQuantity ?? 0}`} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: alpha(brand[500], 0.08), color: brand[700], flexShrink: 0 }} />
                                    </Stack>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.83rem', color: neutral[500] }}>No stock items have been added</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Totals */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                        <TotalCard icon={<PaidOutlinedIcon />} label="Total Cost" value={fmtMoney(totalCostPrice)} tone={brand} />
                        <TotalCard icon={<SellOutlinedIcon />} label="Total Purchase Price" value={fmtMoney(totalPurchasePrice)} tone={gold} />
                    </Stack>

                    {/* Warning */}
                    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ p: 1.75, borderRadius: 2, bgcolor: alpha(gold[500], 0.07), border: `1px solid ${alpha(gold[500], 0.25)}` }}>
                        <WarningAmberIcon sx={{ fontSize: 18, color: gold[700], mt: 0.1, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.82rem', color: neutral[700], lineHeight: 1.5 }}>
                            Once submitted, this information cannot be easily modified. Please ensure all details are correct.
                        </Typography>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${border.subtle}`, gap: 1.25 }}>
                    <MuiButton
                        onClick={() => setConfirmModalOpen(false)}
                        disabled={sendingRequest}
                        variant="outlined"
                        sx={{ height: 42, px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: border.default, color: neutral[600], '&:hover': { borderColor: neutral[400], bgcolor: neutral[50] } }}
                    >
                        Review Again
                    </MuiButton>
                    <MuiButton
                        onClick={onSubmit}
                        disabled={sendingRequest}
                        variant="contained"
                        startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleOutlineIcon fontSize="small" />}
                        sx={{
                            height: 42, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                            bgcolor: brand[500], boxShadow: `0 3px 10px ${alpha(brand[500], 0.3)}`,
                            '&:hover': { bgcolor: brand[700], boxShadow: `0 5px 16px ${alpha(brand[500], 0.4)}` },
                            '&.Mui-disabled': { bgcolor: alpha(brand[500], 0.5), color: '#fff' },
                        }}
                    >
                        {sendingRequest ? 'Submitting…' : 'Confirm & Submit'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
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
            {/* ── Page Nav Bar ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(ROUTES.INVENTORY)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            cursor: 'pointer',
                            color: alpha(PRIMARY_COLOR, 0.85),
                            px: 1.5,
                            py: 0.6,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.22)}`,
                            bgcolor: alpha(PRIMARY_COLOR, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: alpha(PRIMARY_COLOR, 0.09),
                                borderColor: alpha(PRIMARY_COLOR, 0.4),
                                color: PRIMARY_COLOR,
                            },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to Inventory
                        </Typography>
                    </Box>

                    <Breadcrumbs
                        separator="›"
                        sx={{
                            '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 },
                            display: { xs: 'none', sm: 'flex' },
                        }}
                    >
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />
                            Home
                        </Link>
                        <Link
                            underline="hover"
                            onClick={() => navigate(ROUTES.INVENTORY)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                            <InventoryIcon sx={{ fontSize: 14 }} />
                            Inventory
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>
                            Create Stock
                        </Typography>
                    </Breadcrumbs>
                </Stack>

                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    label="New Stock Entry"
                    size="small"
                    sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                        '& .MuiChip-icon': { color: PRIMARY_COLOR },
                    }}
                />
            </Box>

            {/* ── Form ── */}
            <ConfirmationModal />
            <form autoComplete="off" onSubmit={handleSubmit(handleFormPreSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InventoryForm
                            handleClose={() => { }}
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Box>
    )
}

export default CreateInventory