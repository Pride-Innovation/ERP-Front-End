/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import {
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Breadcrumbs,
    Typography,
    alpha,
    Chip,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Fade,
    Card
} from "@mui/material";
import { useForm } from "react-hook-form";
import { IInventory, IInventoryAxiosResponse } from "./interface";
import InventoryForm from "./InventoryForm";
import { useNavigate, useParams } from "react-router";
import { completeDeliveryService, fetchInventoryByIDService } from "./service";
import { inventoryMock } from "../../mocks/inventory";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ICommodity } from "../settings/commodity/interface";
import { StockRowData } from "../../components/forms/interface";
import { RequestContext } from "../../context/request/RequestContext";
import CommodityUtills from "../settings/commodity/utills";
import {
    cleanNewDeliveries,
    generateReferenceNumber,
    validatePartialDeliveries
} from "../../utils/helpers";
import { toast } from "react-toastify";
import ButtonComponent from "../../components/forms/Button";
// Import icons
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ROUTES } from "../../core/routes/routes";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const UpdateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [defaultInventory, setDefaultInventory] = useState<any>(inventoryMock[0]);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const { id } = useParams<{ id: string }>();
    const { setStockRows, stockRows } = useContext(RequestContext);
    const { fetchAllCommodities } = CommodityUtills();
    // Add confirmation modal state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [formDataToSubmit, setFormDataToSubmit] = useState<IInventory | null>(null);
    const navigate = useNavigate();

    useEffect(() => { fetchAllCommodities() }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetchInventoryByIDService(id as string) as IInventoryAxiosResponse;
            if (response.status === 200) {
                const { data } = response;
                setDefaultInventory({
                    ...data,
                    supplier: data.supplier?.id
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => { fetchInventory() }, [id])

    const handleRows = () => {
        if (defaultInventory?.commodities
            && commodities?.length > 0) {
            const rowData = (defaultInventory.commodities as Array<{
                commodity: ICommodity,
                orderedQuantity: number,
                deliveredQuantity: number,
                costPrice: number,
                purchasePrice: number,
            }>
            ).map((commodity, index) => ({
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

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IInventory>({
        mode: 'onChange',
        // resolver: yupResolver(inventorySchema),
    });

    useEffect(() => {
        handleRows()
        reset({ ...defaultInventory });
    }, [defaultInventory]);

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

        const errors = validatePartialDeliveries(stockRows, formDataToSubmit?.commodities as any);

        if (errors.length > 0) {
            setSendingRequest(false);
            return toast.error(`Requests validation errors: ${errors}`)
        }

        const cleanedCommodities = cleanNewDeliveries(
            formDataToSubmit.commodities ?? [],
            stockRows as Array<StockRowData>
        );

        try {
            const data = {
                additionalDeliveries: cleanedCommodities,
                grnNumber: generateReferenceNumber()
            }

            const response = await completeDeliveryService(data, id as string) as IInventoryAxiosResponse;
            if (response.status === 201) {
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

    // Helper function to get supplier name
    const getSupplierName = () => {
        if (!defaultInventory?.supplier?.name) return "Not specified";
        return defaultInventory.supplier.name;
    };

    // Confirmation Modal Component
    const ConfirmationModal = () => (
        <Dialog
            open={confirmModalOpen}
            onClose={() => !sendingRequest && setConfirmModalOpen(false)}
            maxWidth="md"
            fullWidth
            TransitionComponent={Fade}
        >
            <DialogTitle sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${alpha('#000', 0.08)}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlineIcon color="success" />
                    <Typography variant="h6">Confirm Inventory Update</Typography>
                </Box>
                <IconButton
                    onClick={() => setConfirmModalOpen(false)}
                    aria-label="close"
                    size="small"
                    disabled={sendingRequest}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Please review the following information before updating:
                    </Typography>

                    {/* LPO Details */}
                    <Card
                        elevation={0}
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            border: `1px solid ${alpha('#000', 0.08)}`
                        }}
                    >
                        <Box sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05), p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: PRIMARY_COLOR }} />
                                LPO Information
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                            LPO Number
                                        </TableCell>
                                        <TableCell>
                                            {formDataToSubmit?.lpoNumber || defaultInventory?.lpoNumber || 'Not specified'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                            Inventory Name
                                        </TableCell>
                                        <TableCell>
                                            {formDataToSubmit?.name || defaultInventory?.name || 'Not specified'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                            Supplier
                                        </TableCell>
                                        <TableCell>
                                            {getSupplierName()}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                            LPO Number
                                        </TableCell>
                                        <TableCell>
                                            {formDataToSubmit?.lpoNumber || defaultInventory?.lpoNumber || 'Not specified'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>

                    {/* Items Summary */}
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${alpha('#000', 0.08)}`
                        }}
                    >
                        <Box sx={{ bgcolor: alpha(SECONDARY_COLOR, 0.05), p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                <InventoryIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: SECONDARY_COLOR }} />
                                Stock Items ({stockRows.length})
                            </Typography>
                        </Box>

                        {stockRows.length > 0 ? (
                            <TableContainer sx={{ maxHeight: 200 }}>
                                <Table size="small" stickyHeader>
                                    <TableBody>
                                        {stockRows.map((item, idx) => (
                                            <TableRow key={`item-${idx}`}>
                                                <TableCell sx={{ width: '45%' }}>
                                                    {item.name || 'Unknown Item'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={`Qty: ${item.deliveredQuantity || item.orderedQuantity}`}
                                                        sx={{
                                                            bgcolor: alpha(SECONDARY_COLOR, 0.1),
                                                            color: SECONDARY_COLOR,
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    No stock items have been added
                                </Typography>
                            </Box>
                        )}
                    </Card>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: alpha('#FFFDE7', 0.5),
                        border: `1px solid ${alpha('#FBC02D', 0.2)}`,
                        borderRadius: 1
                    }}
                >
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon sx={{ color: '#F57F17', fontSize: '1.1rem' }} />
                        Please verify that the delivery information is correct before updating.
                    </Typography>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                <Box sx={{ display: 'flex', gap: 2, width: '50%', justifyContent: 'flex-end' }}>
                    <ButtonComponent
                        handleClick={() => setConfirmModalOpen(false)}
                        buttonColor="inherit"
                        type="button"
                        sendingRequest={false}
                        buttonText="Review Again"
                        variant="outlined"
                    />
                    <ButtonComponent
                        handleClick={onSubmit}
                        buttonColor="success"
                        type="button"
                        sendingRequest={sendingRequest}
                        buttonText="Update Inventory"
                        variant="contained"
                    />

                </Box>
            </DialogActions>
        </Dialog>
    );

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
                            Update Stock
                        </Typography>
                    </Breadcrumbs>
                </Stack>

                <Chip
                    icon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={`Updating: ${defaultInventory?.name || defaultInventory?.lpoNumber || 'Stock Record'}`}
                    size="small"
                    sx={{
                        height: 26,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: alpha('#0369a1', 0.07),
                        color: '#0369a1',
                        border: `1px solid ${alpha('#0369a1', 0.2)}`,
                        '& .MuiChip-icon': { color: '#0369a1' },
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
    );
};

export default UpdateInventory;