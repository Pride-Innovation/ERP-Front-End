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
    Fade
} from "@mui/material";
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import { IDepartment } from './interface';
import { crudStates } from '../../../utils/constants';
import DepartmentUtills from './utills';
import ModalComponent from '../../../components/modal';
import CreateDepartment from './CreateDepartment';
import UpdateDepartment from './UpdateDepartment';
import DeleteDepartment from './DeleteDepartment';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Loading from '../../../components/loading';
import DepartmentDetails from './DepartmentDetails';

const PRIMARY = '#08796C';

const Departments = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllDepartments, loading } = DepartmentUtills();
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment>({} as IDepartment);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const theme = useTheme();

    const { departments } = useSelector((state: RootState) => state.DepartmentStore);

    useEffect(() => {
        fetchAllDepartments();
    }, []);

    const createDepartment = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const updateDepartment = (department: IDepartment) => {
        setCurrentDepartment(department);
        setModalState(crudStates.update);
        handleOpen();
    };

    const deleteDepartment = (department: IDepartment) => {
        setCurrentDepartment(department);
        setModalState(crudStates.delete);
        handleOpen();
    };

    // Filter departments based on search term
    const filteredDepartments = departments.filter(department =>
        searchTerm === "" ||
        department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.headOfDepartment?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.headOfDepartment?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Modals */}
            {modalState === crudStates.create && (
                <ModalComponent width="60%" title="Create Department" open={open} handleClose={handleClose}>
                    <CreateDepartment
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.update && (
                <ModalComponent width="60%" title="Update Department" open={open} handleClose={handleClose}>
                    <UpdateDepartment
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        department={currentDepartment}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.delete && (
                <ModalComponent width="40%" title="Delete Department" open={open} handleClose={handleClose}>
                    <DeleteDepartment
                        department={currentDepartment}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        buttonText="Delete"
                    />
                </ModalComponent>
            )}

            {/* Sub-page Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, pb: 2.5, borderBottom: '1px solid #E2E8F0' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #08796C, #065E53)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AccountTreeOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>Department Management</Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>Manage organizational departments, leadership, and team structures</Typography>
                    </Box>
                </Stack>
                <Box sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, borderRadius: '6px', px: 1.5, py: 0.5, fontSize: '0.75rem', flexShrink: 0, mt: 0.5 }}>
                    {filteredDepartments.length} departments
                </Box>
            </Box>

            {/* Filter Bar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                    sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                />
                <Button onClick={createDepartment} startIcon={<AddIcon />} variant="contained"
                    sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                    Add Department
                </Button>
            </Stack>

            {/* Department Cards */}
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
                        <Loading items="departments" />
                    </Paper>
                ) : filteredDepartments.length > 0 ? (
                    <Fade in={!loading}>
                        <Grid container spacing={3}>
                            {filteredDepartments.map((department) => (
                                <Grid item xs={12} sm={6} md={6} lg={6} key={department.id}>
                                    <DepartmentDetails
                                        department={department}
                                        deleteDepartment={deleteDepartment}
                                        updateDepartment={updateDepartment}
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
                            <AccountTreeOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {searchTerm ? "No matching departments found" : "No departments available"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {searchTerm
                                    ? "Try adjusting your search criteria to find what you're looking for."
                                    : "Get started by adding your first department to organize your workforce structure."
                                }
                            </Typography>

                            {searchTerm ? (
                                <Button
                                    variant="outlined"
                                    onClick={() => setSearchTerm("")}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Clear Search
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={createDepartment}
                                    startIcon={<AddIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 1.5,
                                        px: 3
                                    }}
                                >
                                    Add Department
                                </Button>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    );
};

export default Departments;