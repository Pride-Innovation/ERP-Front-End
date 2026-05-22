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
  FormControl,
  Select,
  MenuItem,
  Pagination
} from "@mui/material";
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import ModalComponent from "../../../components/modal";
import { crudStates } from "../../../utils/constants";
import CommodityUtills from "./utills";
import Loading from "../../../components/loading";
import { ICommodity } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import CommodityCard from "./ViewCommodity";
import CreateCommodity from "./CreateCommodity";
import UpdateCommodity from "./UpdateCommodity";
import DeleteCommodity from "./DeleteCommodity";
import { useDebounce } from "../../../hooks/useDebounce";
import { RequirePermission } from "../../../core/permissions";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { PageHero } from "../../../components/layout";

const PRIMARY = '#08796C';

const Commodities = () => {
  const [currentCommodity, setCurrentCommodity] = useState<ICommodity>({} as ICommodity);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [assetTypeFilter, setAssetTypeFilter] = useState<number | "all">("all");
  const [pageNumber, setPageNumber] = useState<number>(0);
  const pageSize = 9;

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { commodities, totalPages, totalElements } = useSelector((state: RootState) => state.CommodityStore);
  const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
  const theme = useTheme();

  const {
    modalState,
    handleClose,
    open,
    loading,
    setModalState,
    handleOpen,
    fetchAllCommodities
  } = CommodityUtills();

  useEffect(() => {
    fetchAllCommodities({
      pageNumber,
      pageSize,
      name: debouncedSearch || undefined,
      assetTypeId: assetTypeFilter !== "all" ? assetTypeFilter : undefined,
    });
  }, [pageNumber, debouncedSearch, assetTypeFilter]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPageNumber(0);
  };

  const handleAssetTypeChange = (value: number | "all") => {
    setAssetTypeFilter(value);
    setPageNumber(0);
  };

  const hasActiveFilters = searchTerm !== "" || assetTypeFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setAssetTypeFilter("all");
    setPageNumber(0);
  };

  const createCommodity = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateCommodity = (commodity: ICommodity) => {
    setCurrentCommodity(commodity);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteCommodity = (commodity: ICommodity) => {
    setCurrentCommodity(commodity);
    setModalState(crudStates.delete);
    handleOpen();
  };

  return (
    <>
      {/* Modals */}
      {modalState === crudStates.create && (
        <ModalComponent width="60%" title="Create Commodity" open={open} handleClose={handleClose}>
          <CreateCommodity
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="60%" title="Update Commodity" open={open} handleClose={handleClose}>
          <UpdateCommodity
            commodity={currentCommodity}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="40%" title="Delete Commodity" open={open} handleClose={handleClose}>
          <DeleteCommodity
            commodity={currentCommodity}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}

      <PageHero
        title="Commodity Management"
        subtitle="Manage commodity types, asset classifications, and inventory categories"
        icon={<CategoryOutlinedIcon />}
        stat={{ value: totalElements ?? 0, label: 'records' }}
        actions={
          <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
            <Button onClick={createCommodity} startIcon={<AddIcon />} variant="contained"
              sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
              Add Commodity
            </Button>
          </RequirePermission>
        }
      />

      {/* Filter Bar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search commodities..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
            sx={{ minWidth: 220, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
          />
          <FormControl size="small" variant="outlined" sx={{ minWidth: 180, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}>
            <Select
              value={assetTypeFilter}
              onChange={(e) => handleAssetTypeChange(e.target.value as number | "all")}
              startAdornment={<FilterListIcon fontSize="small" sx={{ ml: 0.5, mr: 1, color: PRIMARY, opacity: 0.8 }} />}
              displayEmpty
              renderValue={(value) => (<Typography variant="body2" sx={{ fontWeight: 500, color: value === "all" ? '#94A3B8' : PRIMARY }}>{value === "all" ? "All Asset Types" : assetTypes.find(a => a.id === value)?.name ?? "Selected"}</Typography>)}
              MenuProps={{ PaperProps: { elevation: 4, sx: { mt: 0.5, borderRadius: 1.5, maxHeight: 300 } } }}
            >
              <MenuItem value="all" sx={{ py: 1 }}><Typography variant="body2">All Asset Types</Typography></MenuItem>
              {assetTypes.map(assetType => (<MenuItem key={assetType.id as number} value={assetType.id as number} sx={{ py: 1 }}><Typography variant="body2">{assetType.name}</Typography></MenuItem>))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Commodity Cards */}
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
            <Loading items="commodities" />
          </Paper>
        ) : commodities.length > 0 ? (
          <Fade in={!loading}>
            <Box>
              <Grid container spacing={3}>
                {commodities.map((commodity) => (
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={4} key={commodity.id}>
                    <CommodityCard
                      commodity={commodity}
                      deleteCommodity={deleteCommodity}
                      updateCommodity={updateCommodity}
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
              <CategoryOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters ? "No matching commodities found" : "No commodities available"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by creating your first commodity to define asset categories and inventory types."
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
                    onClick={createCommodity}
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1.5,
                      px: 3
                    }}
                  >
                    Create Commodity
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

export default Commodities;
