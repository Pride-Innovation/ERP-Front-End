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
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';

import { IRegion } from './interface';
import { crudStates } from '../../../utils/constants';
import RegionUtills from './utills';
import ModalComponent from '../../../components/modal';
import CreateRegion from './CreateRegion';
import UpdateRegion from './UpdateRegion';
import DeleteRegion from './DeleteRegion';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Loading from '../../../components/loading';
import RegionDetails from './RegionDetails';

const Regions = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllRegions, loading } = RegionUtills();
    const [currentRegion, setCurrentRegion] = useState<IRegion>({} as IRegion);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const theme = useTheme();

    const { regions } = useSelector((state: RootState) => state.RegionStore);

    useEffect(() => {
        fetchAllRegions();
    }, []);

    const createRegion = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const updateRegion = (region: IRegion) => {
        setCurrentRegion(region);
        setModalState(crudStates.update);
        handleOpen();
    };

    const deleteRegion = (region: IRegion) => {
        setCurrentRegion(region);
        setModalState(crudStates.delete);
        handleOpen();
    };

    // Filter regions based on search term
    const filteredRegions = regions.filter(region =>
        searchTerm === "" ||
        region.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Modals */}
            {modalState === crudStates.create && (
                <ModalComponent width="50%" title="Create Region" open={open} handleClose={handleClose}>
                    <CreateRegion
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.update && (
                <ModalComponent width="50%" title="Update Region" open={open} handleClose={handleClose}>
                    <UpdateRegion
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        region={currentRegion}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.delete && (
                <ModalComponent width="40%" title="Delete Region" open={open} handleClose={handleClose}>
                    <DeleteRegion
                        region={currentRegion}
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
                    <PublicOutlinedIcon color="primary" />
                    <Typography variant="h5" fontWeight={600} color="primary">
                        Region Management
                    </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage geographical regions for branch organization and distribution
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
                        placeholder="Search regions..."
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
                        onClick={createRegion}
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
                        Add New Region
                    </Button>
                </Stack>
            </Box>

            {/* Region Cards */}
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
                        <Loading items="regions" />
                    </Paper>
                ) : filteredRegions.length > 0 ? (
                    <Fade in={!loading}>
                        <Grid container spacing={3}>
                            {filteredRegions.map((region) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={region.id}>
                                    <RegionDetails
                                        region={region}
                                        deleteRegion={deleteRegion}
                                        updateRegion={updateRegion}
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
                            <PublicOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {searchTerm ? "No matching regions found" : "No regions available"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {searchTerm
                                    ? "Try adjusting your search criteria to find what you're looking for."
                                    : "Get started by adding your first region to organize your branch network."
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
                                    onClick={createRegion}
                                    startIcon={<AddIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 1.5,
                                        px: 3
                                    }}
                                >
                                    Add Region
                                </Button>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    );
};

export default Regions;