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

            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <AccountTreeOutlinedIcon color="primary" />
                    <Typography variant="h5" fontWeight={600} color="primary">
                        Department Management
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage organizational departments, leadership, and team structures
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Toolbar with Search and Actions */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                >
                    <TextField
                        size="small"
                        placeholder="Search departments..."
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

                    <Button
                        onClick={createDepartment}
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
                        Add New Department
                    </Button>
                </Stack>
            </Box>

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
                                <Grid item xs={12} sm={6} md={4} lg={3} key={department.id}>
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