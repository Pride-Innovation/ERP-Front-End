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
    Pagination,
    Chip
} from "@mui/material";
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
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
import { useDebounce } from '../../../hooks/useDebounce';
import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { PageHero } from '../../../components/layout';

const PRIMARY = '#08796C';

const Regions = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllRegions, loading } = RegionUtills();
    const [currentRegion, setCurrentRegion] = useState<IRegion>({} as IRegion);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [pageNumber, setPageNumber] = useState<number>(0);
    const pageSize = 9;
    const theme = useTheme();

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { regions, totalPages, totalElements } = useSelector((state: RootState) => state.RegionStore);

    useEffect(() => {
        fetchAllRegions({
            pageNumber,
            pageSize,
            name: debouncedSearch || undefined,
        });
    }, [pageNumber, debouncedSearch]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPageNumber(0);
    };

    const hasActiveFilters = searchTerm !== "";

    const clearFilters = () => {
        setSearchTerm("");
        setPageNumber(0);
    };

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

            <PageHero
                title="Region Management"
                subtitle="Manage geographical regions for branch organization and distribution"
                icon={<PublicOutlinedIcon />}
                stat={{ value: totalElements ?? 0, label: 'records' }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button onClick={createRegion} startIcon={<AddIcon />} variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                            Add Region
                        </Button>
                    </RequirePermission>
                }
            />

            {/* Filter Bar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    <TextField
                        size="small"
                        placeholder="Search regions..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                        sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                    />
                    {hasActiveFilters && (
                        <Chip
                            label="Clear filters"
                            size="small"
                            onDelete={clearFilters}
                            deleteIcon={<FilterListOffIcon fontSize="small" />}
                            sx={{ height: 36, borderRadius: '8px', bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 600, '& .MuiChip-deleteIcon': { color: PRIMARY } }}
                        />
                    )}
                </Stack>
            </Stack>

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
                ) : regions.length > 0 ? (
                    <Fade in={!loading}>
                        <Box>
                            <Grid container spacing={3}>
                                {regions.map((region) => (
                                    <Grid item xs={12} sm={6} md={6} lg={4} xl={4} key={region.id}>
                                        <RegionDetails
                                            region={region}
                                            deleteRegion={deleteRegion}
                                            updateRegion={updateRegion}
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
                                            '& .Mui-selected': { bgcolor: `${PRIMARY} !important`, color: '#fff' }
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
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Clear Search
                                </Button>
                            ) : (
                                <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
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
                                </RequirePermission>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    );
};

export default Regions;