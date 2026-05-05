/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Grid,
  useTheme,
  Typography,
  Button,
  Stack,
  Divider,
  alpha,
  Fade,
  Paper,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Pagination,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";
import ViewBranch from "./ViewBranch";
import UpdateBranch from "./UpdateBranch";
import DeleteBranch from "./DeleteBranch";
import { IBranch } from "./interface";
import BranchUtills from "./utills";
import { useCallback, useEffect, useState } from "react";
import { crudStates } from "../../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import Loading from "../../../components/loading";
import { useDebounce } from "../../../hooks/useDebounce";

const PRIMARY = '#08796C';

const Branches = () => {
  const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const [nameFilter, setNameFilter] = useState<string>("");
  const [regionId, setRegionId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  const debouncedName = useDebounce(nameFilter, 400);

  const { branches } = useSelector((state: RootState) => state.BranchStore);
  const {
    modalState,
    open,
    handleClose,
    handleOpen,
    setModalState,
    loading,
    fetchAllBranches,
    totalElements,
    totalPages,
    optionsObject,
  } = BranchUtills();

  const theme = useTheme();

  const buildParams = useCallback(() => {
    const params: Record<string, any> = {};
    if (debouncedName) params.name = debouncedName;
    if (regionId !== "") params.regionId = Number(regionId);
    if (districtId !== "") params.districtId = Number(districtId);
    return params;
  }, [debouncedName, regionId, districtId]);

  // Fetch whenever filters or page change
  useEffect(() => {
    fetchAllBranches(buildParams(), page, pageSize);
  }, [debouncedName, regionId, districtId, page, pageSize]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedName, regionId, districtId]);

  const clearFilters = () => {
    setNameFilter("");
    setRegionId("");
    setDistrictId("");
    setPage(0);
  };

  const hasActiveFilters = nameFilter !== "" || regionId !== "" || districtId !== "";

  const createBranch = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateBranch = (branch: IBranch) => {
    setCurrentBranch(branch);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteBranch = (branch: IBranch) => {
    setCurrentBranch(branch);
    setModalState(crudStates.delete);
    handleOpen();
  };

  return (
    <>
      {/* Modals */}
      {modalState === crudStates.create && (
        <ModalComponent width="60%" title="Create Branch" open={open} handleClose={handleClose}>
          <CreateBranch
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="50%" title="Update Branch" open={open} handleClose={handleClose}>
          <UpdateBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Branch" open={open} handleClose={handleClose}>
          <DeleteBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}

      {/* Sub-page Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          pb: 2.5,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #08796C, #065E53)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AccountBalanceOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>
              Branch Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Manage branch offices across regions and districts
            </Typography>
          </Box>
        </Stack>
        <Box
          sx={{
            bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700,
            borderRadius: '6px', px: 1.5, py: 0.5, fontSize: '0.75rem',
            flexShrink: 0, mt: 0.5,
          }}
        >
          {totalElements} {totalElements === 1 ? 'branch' : 'branches'}
        </Box>
      </Box>

      {/* Filter Bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ flex: 1 }}
        >
          <TextField
            size="small"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 220,
              flex: { xs: 1, md: "unset" },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', height: 36, bgcolor: '#fff',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: PRIMARY },
                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
              },
            }}
          />

          <FormControl
            size="small"
            variant="outlined"
            sx={{
              minWidth: 160,
              flex: { xs: 1, md: "unset" },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', height: 36, bgcolor: '#fff',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: PRIMARY },
                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
              },
            }}
          >
            <Select
              value={regionId}
              onChange={(e) => { setRegionId(e.target.value as string); }}
              displayEmpty
              renderValue={(value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: value === "" ? '#94A3B8' : PRIMARY }}>
                  {value === "" ? "All Regions" : (optionsObject.regionsOptions.find(o => o.value === value)?.label ?? "Region")}
                </Typography>
              )}
              MenuProps={{ PaperProps: { elevation: 4, sx: { mt: 0.5, borderRadius: 1.5, maxHeight: 300 } } }}
            >
              <MenuItem value="">
                <Typography variant="body2">All Regions</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {optionsObject.regionsOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ py: 1 }}>
                  <Typography variant="body2">{opt.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            variant="outlined"
            sx={{
              minWidth: 160,
              flex: { xs: 1, md: "unset" },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px', height: 36, bgcolor: '#fff',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: PRIMARY },
                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
              },
            }}
          >
            <Select
              value={districtId}
              onChange={(e) => { setDistrictId(e.target.value as string); }}
              displayEmpty
              renderValue={(value) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: value === "" ? '#94A3B8' : PRIMARY }}>
                  {value === "" ? "All Districts" : (optionsObject.districtsOptions.find(o => o.value === value)?.label ?? "District")}
                </Typography>
              )}
              MenuProps={{ PaperProps: { elevation: 4, sx: { mt: 0.5, borderRadius: 1.5, maxHeight: 300 } } }}
            >
              <MenuItem value="">
                <Typography variant="body2">All Districts</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {optionsObject.districtsOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ py: 1 }}>
                  <Typography variant="body2">{opt.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Chip
              label="Clear filters"
              size="small"
              onDelete={clearFilters}
              onClick={clearFilters}
              sx={{ height: 36, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500 }}
            />
          )}
        </Stack>

        <Button
          onClick={createBranch}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            height: 36, px: 2.5, borderRadius: '8px',
            textTransform: 'none', fontWeight: 600,
            bgcolor: PRIMARY, flexShrink: 0,
            '&:hover': { bgcolor: '#065E53' },
            boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
          }}
        >
          Add Branch
        </Button>
      </Stack>

      {/* Branch Cards */}
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
            <Loading items="branches" />
          </Paper>
        ) : branches.length > 0 ? (
          <>
            <Fade in={!loading}>
              <Grid container spacing={3}>
                {branches.map((branch) => (
                  <Grid item xs={12} sm={6} md={6} lg={6} xl={4} key={branch.id}>
                    <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
                  </Grid>
                ))}
              </Grid>
            </Fade>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, value) => setPage(value - 1)}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': { borderRadius: '8px' },
                    '& .Mui-selected': { bgcolor: `${PRIMARY} !important`, color: '#fff' },
                  }}
                />
              </Box>
            )}
          </>
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
              <AccountBalanceOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters
                  ? "No matching branches found"
                  : "No branches available"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by creating your first branch office to manage bank locations."
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
                  onClick={createBranch}
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1.5,
                    px: 3
                  }}
                >
                  Create Branch
                </Button>
              )}
            </Paper>
          </Fade>
        )}
      </Box>
    </>
  );
};

export default Branches;