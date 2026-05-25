/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
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
import { RequirePermission } from "../../../core/permissions";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { PageHero } from "../../../components/layout";

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

            <PageHero
                title="Supplier Management"
                subtitle="Manage supplier information, contact details, and commodity associations"
                icon={<LocalShippingOutlinedIcon />}
                stat={{ value: totalElements ?? 0, label: 'records' }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button onClick={createSupplier} startIcon={<AddIcon />} variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                            Add Supplier
                        </Button>
                    </RequirePermission>
                }
            />

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
                            <Box className="settings-card-grid--wide">
                                {suppliers.map((supplier, i) => (
                                    <SupplierDetails
                                        key={supplier.id}
                                        supplier={supplier}
                                        deleteSupplier={deleteSupplier}
                                        updateSupplier={updateSupplier}
                                        index={i}
                                    />
                                ))}
                            </Box>
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
                                <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
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
                                </RequirePermission>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    );
};

export default Suppliers;