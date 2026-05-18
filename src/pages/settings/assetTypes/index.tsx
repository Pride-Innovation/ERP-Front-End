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
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Divider,
} from '@mui/material';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import { IAssetType } from './interface';
import FieldConfigModal from './FieldConfigModal';
import { crudStates } from '../../../utils/constants';
import AssetTypeUtills from './utills';
import ModalComponent from '../../../components/modal';
import CreateAssetType from './CreateAssetType';
import UpdateAssetType from './UpdateAssetType';
import DeleteAssetType from './DeleteAssetType';
import Loading from '../../../components/loading';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useDebounce } from '../../../hooks/useDebounce';

const PRIMARY = '#08796C';

// Color palette for category cards
const CATEGORY_COLORS = [
    '#08796C', '#1976D2', '#7B1FA2', '#C62828', '#E65100',
    '#2E7D32', '#00838F', '#558B2F', '#4527A0', '#283593',
    '#AD1457', '#6D4C41',
];

const getCategoryColor = (index: number) => CATEGORY_COLORS[index % CATEGORY_COLORS.length];

const AssetTypeCard = ({
    assetType,
    index,
    onEdit,
    onDelete,
    onConfigure,
}: {
    assetType: IAssetType;
    index: number;
    onEdit: (at: IAssetType) => void;
    onDelete: (at: IAssetType) => void;
    onConfigure: (at: IAssetType) => void;
}) => {
    const color = getCategoryColor(index);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(color, 0.18)}`,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
                    transform: 'translateY(-2px)',
                    borderColor: alpha(color, 0.35),
                },
            }}
        >
            {/* Top colour bar */}
            <Box sx={{ height: 4, bgcolor: color }} />

            <Box sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Icon */}
                    <Avatar
                        sx={{
                            width: 48,
                            height: 48,
                            bgcolor: alpha(color, 0.1),
                            color: color,
                            borderRadius: '12px',
                            flexShrink: 0,
                            border: `1px solid ${alpha(color, 0.2)}`,
                        }}
                    >
                        <CategoryOutlinedIcon fontSize="small" />
                    </Avatar>

                    {/* Main info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}
                                noWrap
                            >
                                {assetType.name}
                            </Typography>
                            {assetType.shortCode && (
                                <Chip
                                    label={assetType.shortCode}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        bgcolor: alpha(color, 0.1),
                                        color: color,
                                        border: `1px solid ${alpha(color, 0.3)}`,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            )}
                        </Stack>
                        {assetType.description && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.5,
                                }}
                            >
                                {assetType.description}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(color, 0.1) }} />

                {/* Field config badge */}
                {assetType.fieldConfig && (
                    <Chip
                        size="small"
                        icon={<TuneOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                        label="Fields configured"
                        sx={{
                            mb: 1.5,
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            bgcolor: alpha(color, 0.08),
                            color: color,
                            border: `1px solid ${alpha(color, 0.25)}`,
                            '& .MuiChip-icon': { color },
                        }}
                    />
                )}

                {/* Actions */}
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Tooltip title="Configure fields" arrow>
                        <IconButton
                            size="small"
                            onClick={() => onConfigure(assetType)}
                            sx={{
                                color: '#7B1FA2',
                                bgcolor: alpha('#7B1FA2', 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha('#7B1FA2', 0.14) },
                            }}
                        >
                            <TuneOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit category" arrow>
                        <IconButton
                            size="small"
                            onClick={() => onEdit(assetType)}
                            sx={{
                                color: color,
                                bgcolor: alpha(color, 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(color, 0.14) },
                            }}
                        >
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete category" arrow>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(assetType)}
                            sx={{
                                color: 'error.main',
                                bgcolor: alpha('#ef4444', 0.06),
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha('#ef4444', 0.14) },
                            }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Paper>
    );
};

const AssetTypes = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllAssetTypes, loading } = AssetTypeUtills();
    const [currentAssetType, setCurrentAssetType] = useState<IAssetType>({} as IAssetType);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [configureOpen, setConfigureOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(0);
    const pageSize = 12;
    const theme = useTheme();

    const debouncedSearch = useDebounce<string>(searchTerm, 500);
    const { assetTypes, totalPages, totalElements } = useSelector((state: RootState) => state.AssetTypeStore);

    useEffect(() => {
        fetchAllAssetTypes({ pageNumber, pageSize, name: debouncedSearch || undefined });
    }, [pageNumber, debouncedSearch]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPageNumber(0);
    };

    const hasActiveFilters = searchTerm !== '';

    const clearFilters = () => {
        setSearchTerm('');
        setPageNumber(0);
    };

    const createAssetType = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const editAssetType = (assetType: IAssetType) => {
        setCurrentAssetType(assetType);
        setModalState(crudStates.update);
        handleOpen();
    };

    const deleteAssetType = (assetType: IAssetType) => {
        setCurrentAssetType(assetType);
        setModalState(crudStates.delete);
        handleOpen();
    };

    const configureFields = (assetType: IAssetType) => {
        setCurrentAssetType(assetType);
        setConfigureOpen(true);
    };

    return (
        <>
            {/* Modals */}
            {modalState === crudStates.create && (
                <ModalComponent width="45%" title="Create Asset Category" open={open} handleClose={handleClose}>
                    <CreateAssetType
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.update && (
                <ModalComponent width="45%" title="Update Asset Category" open={open} handleClose={handleClose}>
                    <UpdateAssetType
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        assetType={currentAssetType}
                    />
                </ModalComponent>
            )}
            {/* Field Config Modal */}
            {configureOpen && (
                <ModalComponent
                    width="65%"
                    title={`Configure Fields — ${currentAssetType.name}`}
                    open={configureOpen}
                    handleClose={() => setConfigureOpen(false)}
                >
                    <FieldConfigModal
                        assetType={currentAssetType}
                        handleClose={() => setConfigureOpen(false)}
                    />
                </ModalComponent>
            )}

            {modalState === crudStates.delete && (
                <ModalComponent width="40%" title="Delete Asset Category" open={open} handleClose={handleClose}>
                    <DeleteAssetType
                        assetType={currentAssetType}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
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
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                    >
                        <CategoryOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>
                            Asset Category Management
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                            Define and manage asset categories — each category groups related commodities and assets
                        </Typography>
                    </Box>
                </Stack>
                <Box
                    sx={{
                        bgcolor: alpha(PRIMARY, 0.08),
                        color: PRIMARY,
                        fontWeight: 700,
                        borderRadius: '6px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        flexShrink: 0,
                        mt: 0.5,
                    }}
                >
                    {totalElements} {totalElements === 1 ? 'category' : 'categories'}
                </Box>
            </Box>

            {/* Filter Bar */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 240,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px', height: 36, bgcolor: '#fff',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: PRIMARY },
                                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                            },
                        }}
                    />
                    {hasActiveFilters && (
                        <Chip
                            label="Clear filters"
                            size="small"
                            icon={<FilterListOffIcon fontSize="small" />}
                            onClick={clearFilters}
                            onDelete={clearFilters}
                            sx={{ borderRadius: '6px', fontWeight: 500 }}
                        />
                    )}
                </Stack>
                <Button
                    onClick={createAssetType}
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                        height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none',
                        fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0,
                        '&:hover': { bgcolor: '#065E53' },
                        boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                    }}
                >
                    Add Category
                </Button>
            </Stack>

            {/* Category Grid */}
            <Box sx={{ position: 'relative', minHeight: '200px' }}>
                {loading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center',
                            borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <Loading items="categories" />
                    </Paper>
                ) : assetTypes.length > 0 ? (
                    <Fade in={!loading}>
                        <Grid container spacing={2.5}>
                            {assetTypes.map((assetType, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={assetType.id}>
                                    <AssetTypeCard
                                        assetType={assetType}
                                        index={index}
                                        onEdit={editAssetType}
                                        onDelete={deleteAssetType}
                                        onConfigure={configureFields}
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
                                alignItems: 'center',
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                border: `1px dashed ${alpha(PRIMARY, 0.2)}`,
                            }}
                        >
                            <CategoryOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {hasActiveFilters ? 'No matching categories found' : 'No asset categories yet'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
                                {hasActiveFilters
                                    ? 'Try adjusting your search criteria or clear the filters.'
                                    : 'Create asset categories to organise your commodities and assets. Categories can be seeded via the backend data initializer.'
                                }
                            </Typography>
                            {hasActiveFilters ? (
                                <Button variant="outlined" onClick={clearFilters} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                                    Clear Search
                                </Button>
                            ) : (
                                <Button
                                    onClick={createAssetType}
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{ textTransform: 'none', borderRadius: 1.5, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' } }}
                                >
                                    Add First Category
                                </Button>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={pageNumber + 1}
                        onChange={(_, value) => setPageNumber(value - 1)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </>
    );
};

export default AssetTypes;
