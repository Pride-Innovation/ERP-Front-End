/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Typography,
    Button,
    Stack,
    alpha,
    useTheme,
    Paper,
    InputAdornment,
    TextField,
    Fade,
    Pagination
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

import ModalComponent from "../../../components/modal";
import { crudStates } from "../../../utils/constants";
import SupplierUtills from "./Utills";
import Loading from "../../../components/loading";
import { ISupplier } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import SupplierDetails from "./SupplierDetails";
import CreateSupplier from "./CreateSupplier";
import UpdateSupplier from "./UpdateSupplier";
import DeleteSupplier from "./DeleteSupplier";
import { useDebounce } from "../../../hooks/useDebounce";

const PRIMARY = '#08796C';

const Suppliers = () => {
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier>({} as ISupplier);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [addressFilter, setAddressFilter] = useState<string>("");
    const [pageNumber, setPageNumber] = useState<number>(0);
    const pageSize = 9;

    const debouncedSearch = useDebounce(searchTerm, 500);
    const debouncedAddress = useDebounce(addressFilter, 500);

    const { suppliers, totalPages, totalElements } = useSelector((state: RootState) => state.SuppliersStore);
    const theme = useTheme();

    const {
        modalState,
        handleClose,
        open,
        loading,
        setModalState,
        handleOpen,
        fetchAllSuppliers
    } = SupplierUtills();

    useEffect(() => {
        fetchAllSuppliers({
            pageNumber,
            pageSize,
            name: debouncedSearch || undefined,
            address: debouncedAddress || undefined,
        });
    }, [pageNumber, debouncedSearch, debouncedAddress]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPageNumber(0);
    };

    const handleAddressChange = (value: string) => {
        setAddressFilter(value);
        setPageNumber(0);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setAddressFilter("");
        setPageNumber(0);
    };

    const hasActiveFilters = searchTerm !== "" || addressFilter !== "";

    const createSupplier = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const updateSupplier = (supplier: ISupplier) => {
        setCurrentSupplier(supplier);
        setModalState(crudStates.update);
        handleOpen();
    };

    const deleteSupplier = (supplier: ISupplier) => {
        setCurrentSupplier(supplier);
        setModalState(crudStates.delete);
        handleOpen();
    };

    return (
        <>
            {/* Modals */}
            {modalState === crudStates.create && (
                <ModalComponent width="60%" title="Create Supplier" open={open} handleClose={handleClose}>
                    <CreateSupplier
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.update && (
                <ModalComponent width="60%" title="Update Supplier" open={open} handleClose={handleClose}>
                    <UpdateSupplier
                        supplier={currentSupplier}
                        handleClose={handleClose}
                        setSendingRequest={setSendingRequest}
                        sendingRequest={sendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.delete && (
                <ModalComponent width="40%" title="Delete Supplier" open={open} handleClose={handleClose}>
                    <DeleteSupplier
                        supplier={currentSupplier}
                        handleClose={handleClose}
                        setSendingRequest={setSendingRequest}
                        sendingRequest={sendingRequest}
                        buttonText="Delete"
                    />
                </ModalComponent>
            )}

            {/* Sub-page Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, pb: 2.5, borderBottom: '1px solid #E2E8F0' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #08796C, #065E53)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LocalShippingOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>Supplier Management</Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Manage supplier information, contact details, and commodity associations</Typography>
                    </Box>
                </Stack>
                <Box sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, borderRadius: '6px', px: 1.5, py: 0.5, fontSize: '0.75rem', flexShrink: 0, mt: 0.5 }}>
                    {totalElements} suppliers
                </Box>
            </Box>

            {/* Filter Bar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ flex: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                        sx={{ minWidth: 220, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                    />
                    <TextField
                        size="small"
                        placeholder="Filter by address..."
                        value={addressFilter}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOnOutlinedIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                        sx={{ minWidth: 200, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                    />
                </Stack>
                <Button onClick={createSupplier} startIcon={<AddIcon />} variant="contained"
                    sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                    Add Supplier
                </Button>
            </Stack>

            {/* Supplier Cards */}
            <Box sx={{ position: 'relative', minHeight: '200px' }}>
                {loading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Loading items="suppliers" />
                    </Paper>
                ) : suppliers.length > 0 ? (
                    <Fade in={!loading}>
                        <Box>
                            <Grid container spacing={3}>
                                {suppliers.map((supplier) => (
                                    <Grid item xs={12} sm={6} md={6} lg={6} key={supplier.id}>
                                        <SupplierDetails
                                            supplier={supplier}
                                            deleteSupplier={deleteSupplier}
                                            updateSupplier={updateSupplier}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            {totalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination
                                        count={totalPages}
                                        page={pageNumber + 1}
                                        onChange={(_, value) => setPageNumber(value - 1)}
                                        color="primary"
                                        shape="rounded"
                                        sx={{
                                            '& .MuiPaginationItem-root': { borderRadius: '8px' },
                                            '& .Mui-selected': { bgcolor: PRIMARY, color: '#fff', '&:hover': { bgcolor: '#065E53' } }
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Fade>
                ) : (
                    <Fade in={!loading}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            <LocalShippingOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {hasActiveFilters ? "No matching suppliers found" : "No suppliers available"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {hasActiveFilters
                                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                                    : "Get started by adding your first supplier to manage your supply chain relationships."
                                }
                            </Typography>

                            {hasActiveFilters ? (
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={createSupplier}
                                    startIcon={<AddIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 1.5,
                                        px: 3
                                    }}
                                >
                                    Add Supplier
                                </Button>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    );
};

export default Suppliers;