/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    alpha,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    IconButton,
    Fade,
    Card
} from "@mui/material"
import { IInventory, IInventoryAxiosResponse } from "./interface"
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryForm from "./InventoryForm";
import { RequestContext } from "../../context/request/RequestContext";
import { toast } from "react-toastify";
import { generateReferenceNumber, validateStockItems } from "../../utils/helpers";
import { addStockService } from "./service";
import ButtonComponent from "../../components/forms/Button";
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

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

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
                    <Typography variant="h6">Confirm Inventory Submission</Typography>
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
                        Please review the following information before submitting:
                    </Typography>

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
                                            {formDataToSubmit?.lpoNumber || 'Not specified'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ width: '35%', fontWeight: 600 }}>
                                            Inventory Name
                                        </TableCell>
                                        <TableCell>
                                            {formDataToSubmit?.name || 'Not specified'}
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
                                            PO Number
                                        </TableCell>
                                        <TableCell>
                                            {formDataToSubmit?.lpoNumber || 'Not specified'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>

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
                                                        label={`Qty: ${item.orderedQuantity}`}
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
                        Once submitted, this information cannot be easily modified. Please ensure all details are correct.
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
                        buttonText="Confirm"
                        variant="contained"
                    />
                </Box>
            </DialogActions>
        </Dialog>
    );

    return (
        <Paper elevation={3} sx={{
            borderRadius: 3,
            boxShadow: "none",
            maxWidth: "1300px",
            mx: "auto",
            p: 6
        }}>
            {/* Add confirmation modal */}
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
        </Paper>
    )
}

export default CreateInventory