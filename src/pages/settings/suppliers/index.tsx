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
    Divider,
    alpha,
    useTheme,
    Paper,
    InputAdornment,
    TextField,
    Fade,
    FormControl,
    Select,
    MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
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

const Suppliers = () => {
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier>({} as ISupplier);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filter, setFilter] = useState<string>("all");

    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
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
        fetchAllSuppliers();
    }, []);

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

    // Filter suppliers based on search term and commodity filter
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = searchTerm === "" ||
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === "all" ||
            (supplier.commodity && supplier.commodity.name.toLowerCase() === filter.toLowerCase());

        return matchesSearch && matchesFilter;
    });

    // Get unique commodities for filter
    const commodities = suppliers.map(supplier => supplier.commodity?.name).filter(Boolean);
    const uniqueCommodities = Array.from(new Set(commodities));

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

            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <LocalShippingOutlinedIcon color="primary" />
                    <Typography variant="h5" fontWeight={600} color="primary">
                        Supplier Management
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage supplier information, contact details, and commodity associations
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Toolbar with Search and Actions */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                >
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", sm: "center" }}
                        sx={{ flex: 1 }}
                    >
                        <TextField
                            size="small"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                minWidth: 220,
                                flex: { xs: 1, md: "unset" }
                            }}
                        />

                        <FormControl
                            size="small"
                            variant="outlined"
                            sx={{
                                minWidth: 180,
                                flex: { xs: 1, md: "unset" }
                            }}
                        >
                            <Select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                startAdornment={
                                    <FilterListIcon
                                        fontSize="small"
                                        sx={{
                                            ml: 0.5,
                                            mr: 1,
                                            color: theme.palette.primary.main,
                                            opacity: 0.8
                                        }}
                                    />
                                }
                                displayEmpty
                                renderValue={(value) => (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: 500,
                                            color: value === "all" ? theme.palette.text.secondary : theme.palette.primary.main
                                        }}
                                    >
                                        {value === "all" ? "All Commodities" : value}
                                    </Typography>
                                )}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha(theme.palette.divider, 0.3),
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: alpha(theme.palette.primary.main, 0.5),
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.primary.main,
                                    },
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        elevation: 4,
                                        sx: {
                                            mt: 0.5,
                                            borderRadius: 1.5,
                                            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
                                            maxHeight: 300
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="all" sx={{ py: 1 }}>
                                    <Typography variant="body2">All Commodities</Typography>
                                </MenuItem>

                                {uniqueCommodities.length > 0 && <Divider sx={{ my: 0.5 }} />}

                                {uniqueCommodities.map(commodity => (
                                    <MenuItem key={commodity} value={commodity} sx={{ py: 1 }}>
                                        <Typography variant="body2">{commodity}</Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Button
                        onClick={createSupplier}
                        startIcon={<AddIcon />}
                        variant="contained"
                        color="primary"
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontWeight: 500,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        Add New Supplier
                    </Button>
                </Stack>
            </Box>

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
                ) : filteredSuppliers.length > 0 ? (
                    <Fade in={!loading}>
                        <Grid container spacing={3}>
                            {filteredSuppliers.map((supplier) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={supplier.id}>
                                    <SupplierDetails
                                        supplier={supplier}
                                        deleteSupplier={deleteSupplier}
                                        updateSupplier={updateSupplier}
                                    />
                                </Grid>
                            ))}
                        </Grid>
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
                                {searchTerm || filter !== "all" ? "No matching suppliers found" : "No suppliers available"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {searchTerm || filter !== "all"
                                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                                    : "Get started by adding your first supplier to manage your supply chain relationships."
                                }
                            </Typography>

                            {searchTerm || filter !== "all" ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => { setSearchTerm(""); setFilter("all"); }}
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