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
  MenuItem,
  Pagination
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";

import ModalComponent from "../../../components/modal";
import { crudStates } from "../../../utils/constants";
import TitleUtills from "./utills";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading";
import { ITitle } from "./interface";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import TitleCard from "./TitleCard";
import CreateTitle from "./CreateTitle";
import UpdateTitle from "./UpdateTitle";
import DeleteTitle from "./DeleteTitle";
import { useDebounce } from "../../../hooks/useDebounce";
import { RequirePermission } from "../../../core/permissions";
import { PERMISSIONS } from "../../../core/permissions/constants";
import { PageHero } from "../../../components/layout";

const PRIMARY = '#08796C';

const Titles = () => {
  const [currentTitle, setCurrentTitle] = useState<ITitle>({} as ITitle);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(0);
  const pageSize = 9;

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { titles, totalPages, totalElements } = useSelector((state: RootState) => state.TitleStore);
  const { roles } = useSelector((state: RootState) => state.RoleStore);
  const theme = useTheme();

  const {
    modalState,
    handleClose,
    open,
    loading,
    setModalState,
    handleOpen,
    fetchAllTitles,
    fetchRolesForFilter
  } = TitleUtills();

  useEffect(() => {
    if (!roles || roles.length === 0) {
      fetchRolesForFilter();
    }
  }, []);

  useEffect(() => {
    fetchAllTitles({
      pageNumber,
      pageSize,
      name: debouncedSearch || undefined,
      roleId: roleFilter || undefined,
    });
  }, [pageNumber, debouncedSearch, roleFilter]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPageNumber(0);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPageNumber(0);
  };

  const createTitle = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateTitle = (title: ITitle) => {
    setCurrentTitle(title);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteTitle = (title: ITitle) => {
    setCurrentTitle(title);
    setModalState(crudStates.delete);
    handleOpen();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setPageNumber(0);
  };

  const hasActiveFilters = searchTerm !== "" || roleFilter !== "";

  return (
    <>
      {/* Modals */}
      {modalState === crudStates.create && (
        <ModalComponent width="60%" title="Create Title" open={open} handleClose={handleClose}>
          <CreateTitle
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="60%" title="Update Title" open={open} handleClose={handleClose}>
          <UpdateTitle
            title={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="40%" title="Delete Title" open={open} handleClose={handleClose}>
          <DeleteTitle
            title={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}

      <PageHero
        title="Title Management"
        subtitle="Manage organizational titles and hierarchical reporting structures"
        icon={<WorkOutlineOutlinedIcon />}
        stat={{ value: totalElements ?? 0, label: 'records' }}
        actions={
          <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
            <Button onClick={createTitle} startIcon={<AddIcon />} variant="contained"
              sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
              Add Title
            </Button>
          </RequirePermission>
        }
      />

      {/* Filter Bar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search titles..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
            sx={{ minWidth: 220, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
          />
          <FormControl size="small" variant="outlined" sx={{ minWidth: 180, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}>
            <Select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              startAdornment={<FilterListIcon fontSize="small" sx={{ ml: 0.5, mr: 1, color: PRIMARY, opacity: 0.8 }} />}
              displayEmpty
              renderValue={(value) => {
                const selectedRole = roles?.find(r => String(r.id) === String(value));
                return (
                  <Typography variant="body2" sx={{ fontWeight: 500, color: !value ? '#94A3B8' : PRIMARY }}>
                    {selectedRole ? selectedRole.name : "All Roles"}
                  </Typography>
                );
              }}
              MenuProps={{ PaperProps: { elevation: 4, sx: { mt: 0.5, borderRadius: 1.5, maxHeight: 300 } } }}
            >
              <MenuItem value=""><Typography variant="body2">All Roles</Typography></MenuItem>
              {roles?.length > 0 && <Divider sx={{ my: 0.5 }} />}
              {roles?.map(role => (
                <MenuItem key={role.id} value={String(role.id)} sx={{ py: 1 }}>
                  <Typography variant="body2">{role.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Title Cards */}
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
            <Loading items="titles" />
          </Paper>
        ) : titles.length > 0 ? (
          <Fade in={!loading}>
            <Box>
              <Grid container spacing={3}>
                {titles.map((title) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} xl={4} key={title.id}>
                    <TitleCard title={title} deleteTitle={deleteTitle} updateTitle={updateTitle} />
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
              <WorkOutlineOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasActiveFilters ? "No matching titles found" : "No titles available"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by creating your first organizational title to define roles and hierarchy."
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
                    onClick={createTitle}
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1.5,
                      px: 3
                    }}
                  >
                    Create Title
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

export default Titles;