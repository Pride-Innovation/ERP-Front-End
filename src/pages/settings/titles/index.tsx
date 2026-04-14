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

const PRIMARY = '#08796C';

const Titles = () => {
  const [currentTitle, setCurrentTitle] = useState<ITitle>({} as ITitle);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");

  const { titles } = useSelector((state: RootState) => state.TitleStore);
  const theme = useTheme();

  const {
    modalState,
    handleClose,
    open,
    loading,
    setModalState,
    handleOpen,
    fetchAllTitles
  } = TitleUtills();

  useEffect(() => {
    fetchAllTitles();
  }, []);

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

  // Filter titles based on search term and role filter
  const filteredTitles = titles.filter(title => {
    const matchesSearch = searchTerm === "" ||
      title.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" ||
      (title.role && title.role.name.toLowerCase() === filter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  // Get unique roles for filter
  const roles = titles.map(title => title.role?.name).filter(Boolean);
  const uniqueRoles = Array.from(new Set(roles));

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

      {/* Sub-page Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, pb: 2.5, borderBottom: '1px solid #E2E8F0' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #08796C, #065E53)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WorkOutlineOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>Title Management</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Manage organizational titles and hierarchical reporting structures</Typography>
          </Box>
        </Stack>
        <Box sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, borderRadius: '6px', px: 1.5, py: 0.5, fontSize: '0.75rem', flexShrink: 0, mt: 0.5 }}>
          {filteredTitles.length} titles
        </Box>
      </Box>

      {/* Filter Bar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
            sx={{ minWidth: 220, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
          />
          <FormControl size="small" variant="outlined" sx={{ minWidth: 180, flex: { xs: 1, md: "unset" }, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              startAdornment={<FilterListIcon fontSize="small" sx={{ ml: 0.5, mr: 1, color: PRIMARY, opacity: 0.8 }} />}
              displayEmpty
              renderValue={(value) => (<Typography variant="body2" sx={{ fontWeight: 500, color: value === "all" ? '#94A3B8' : PRIMARY }}>{value === "all" ? "All Roles" : value}</Typography>)}
              MenuProps={{ PaperProps: { elevation: 4, sx: { mt: 0.5, borderRadius: 1.5, maxHeight: 300 } } }}
            >
              <MenuItem value="all" sx={{ py: 1 }}><Typography variant="body2">All Roles</Typography></MenuItem>
              {uniqueRoles.length > 0 && <Divider sx={{ my: 0.5 }} />}
              {uniqueRoles.map(role => (<MenuItem key={role} value={role} sx={{ py: 1 }}><Typography variant="body2">{role}</Typography></MenuItem>))}
            </Select>
          </FormControl>
        </Stack>
        <Button onClick={createTitle} startIcon={<AddIcon />} variant="contained"
          sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
          Add Title
        </Button>
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
        ) : filteredTitles.length > 0 ? (
          <Fade in={!loading}>
            <Grid container spacing={3}>
              {filteredTitles.map((title) => (
                <Grid item xs={12} sm={6} md={6} lg={4} xl={4} key={title.id}>
                  <TitleCard title={title} deleteTitle={deleteTitle} updateTitle={updateTitle} />
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
              <WorkOutlineOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || filter !== "all" ? "No matching titles found" : "No titles available"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Get started by creating your first organizational title to define roles and hierarchy."
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
              )}
            </Paper>
          </Fade>
        )}
      </Box>
    </>
  );
};

export default Titles;