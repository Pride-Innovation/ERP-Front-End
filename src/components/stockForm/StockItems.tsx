/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    IconButton,
    TextField,
    Button,
    Typography,
    alpha,
    Divider,
    Tooltip,
    Stack,
    Zoom,
    useTheme,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CommodityUtills from '../../pages/settings/commodity/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RequestContext } from '../../context/request/RequestContext';
import { StockRowData } from '../forms/interface';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import EighteenMpOutlinedIcon from '@mui/icons-material/EighteenMpOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PriceTotals from './priceTotals';
import { formatNumberWithCommas } from './helper';
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { neutral, border } from '../../utils/tokens';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';
const TABLE_HEADER_BG = alpha(PRIMARY_COLOR, 0.08);
const TABLE_HEADER_COLOR = PRIMARY_COLOR;
const TABLE_BORDER_COLOR = alpha('#000', 0.08);

// Mirrors the "Request Items" table (InventoryTable.tsx) so the selected value
// text and inputs render at the exact same size/weight across both tables.
const selectSx = {
    fontSize: '0.83rem',
    borderRadius: '7px',
    backgroundColor: 'white',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PRIMARY_COLOR, 0.5) },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY_COLOR, borderWidth: 1.5 },
};

const StockItems = () => {
    const theme = useTheme();
    const { fetchAllCommodities } = CommodityUtills();
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string, assetTypeId: number | string }[]>([]);
    const { stockRows, setStockRows, setAssetType } = useContext(RequestContext);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    const handleInputChange = (id: number, field: keyof StockRowData, value: any) => {
        const updatedRows = stockRows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setStockRows(updatedRows);
    };

    const handleAssetTypeNameChange = (id: number, value: string) => {
        const updatedRows = stockRows.map((row) =>
            row.id === id ? { ...row, assetTypeId: value } : row
        );
        setStockRows(updatedRows);

        const selectedType = assetTypes.find((asstyp) => asstyp.id === value);
        if (selectedType) {
            setAssetType(selectedType);
            fetchAllCommodities({ assetTypeId: selectedType.id });
        }
    };

    const handleNameChange = (id: number, value: string) => {
        const selectedItem = commodities.find(item => item.name === value);

        if (!selectedItem) return;

        const updatedRows = stockRows.map(row =>
            row.id === id
                ? {
                    ...row,
                    name: value,
                    groupName: selectedItem.groupName,
                    commodityId: selectedItem.id as number,
                }
                : row
        );
        setStockRows(updatedRows);
    };

    const handleAddRow = () => {
        const newId = Date.now();
        setStockRows([
            ...stockRows,
            {
                id: newId,
                name: '',
                groupName: '',
                orderedQuantity: 0,
                deliveredQuantity: 0,
                commodityId: undefined,
                costPrice: '',
                purchasePrice: ''
            },
        ]);
    };

    const handleRemoveRow = (id: number) => {
        setStockRows(stockRows.filter((row) => row.id !== id));
    };

    useEffect(() => {
        if (commodities && commodities.length > 0) {
            const options = commodities.map((item: any) => ({
                name: item.name,
                groupName: item.groupName,
                assetTypeId: item?.assetType?.id
            }));
            setItemOptions(prev => {
                const merged = [...options, ...prev];
                const uniqueByName = Array.from(new Map(merged.map(item => [item.name, item])).values());
                return uniqueByName;
            });
        }
    }, [commodities]);

    const tableHeaders = [
        {
            name: 'Asset Type',
            icon: <AppRegistrationOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: 'Name',
            icon: <FeedOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Unit Measure",
            icon: <ScaleOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Ordered Qty",
            icon: <EighteenMpOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Delivered Qty",
            icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Cost Price",
            icon: <AttachMoneyIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Purchase Price",
            icon: <MonetizationOnOutlinedIcon sx={{ fontSize: 16 }} />
        },
        {
            name: "Actions",
            icon: <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
        }
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                border: `1px solid ${border.subtle}`,
                overflow: 'hidden',
                bgcolor: '#fff',
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderBottom: `1px solid ${border.subtle}`,
                    bgcolor: '#fff',
                    gap: 1.5,
                    flexWrap: 'wrap',
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1.5,
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                        }}
                    >
                        <ShoppingCartIcon />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: neutral[900] }}>
                            Stock Items
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Add and manage the items received in this delivery
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: PRIMARY_COLOR,
                        borderColor: alpha(PRIMARY_COLOR, 0.4),
                        borderRadius: '8px',
                        '&:hover': {
                            borderColor: PRIMARY_COLOR,
                            bgcolor: alpha(PRIMARY_COLOR, 0.05),
                        },
                    }}
                >
                    Add Item
                </Button>
            </Box>

            <TableContainer
                component={Box}
                sx={{
                    maxHeight: 500,
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha('#000', 0.2),
                        borderRadius: 3,
                    },
                }}
            >
                <Table size="medium" stickyHeader>
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((header, idx) => (
                                <TableCell
                                    key={header?.name}
                                    align={idx === 3 || idx === 4 ? 'center' : idx === 7 ? 'center' : 'left'}
                                    sx={{
                                        bgcolor: TABLE_HEADER_BG,
                                        color: TABLE_HEADER_COLOR,
                                        fontWeight: 600,
                                        fontSize: 14,
                                        borderBottom: `1px solid ${TABLE_BORDER_COLOR}`,
                                        py: 1.75,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={idx === 7 ? 'center' : 'flex-start'}>
                                        {header?.icon}
                                        <Typography variant="subtitle2">
                                            {header?.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {stockRows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? alpha(PRIMARY_COLOR, 0.01) : 'white',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: alpha(PRIMARY_COLOR, 0.04),
                                    },
                                }}
                            >
                                <TableCell sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <Select
                                        fullWidth
                                        value={row.assetTypeId || ""}
                                        onChange={(e) => handleAssetTypeNameChange(row.id, e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }}
                                        sx={{
                                            ...selectSx,
                                            color: row.assetTypeId ? 'text.primary' : 'text.secondary',
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select Type</em>
                                        </MenuItem>
                                        {assetTypes.map((assetTyp) => (
                                            <MenuItem key={assetTyp.id} value={assetTyp.id}>
                                                {assetTyp.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <Select
                                        fullWidth
                                        value={row.name}
                                        onChange={(e) => handleNameChange(row.id, e.target.value)}
                                        displayEmpty
                                        size="small"
                                        disabled={!row.assetTypeId}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }}
                                        sx={{
                                            ...selectSx,
                                            color: row.name ? 'text.primary' : 'text.secondary',
                                            '&.Mui-disabled': { bgcolor: '#F8FAFC' },
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select Item</em>
                                        </MenuItem>
                                        {itemOptions
                                            .filter(ele => ele.assetTypeId === row.assetTypeId)
                                            .map((item) => (
                                                <MenuItem key={item.name} value={item.name}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </TableCell>

                                <TableCell sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.groupName || ''}
                                        InputProps={{
                                            readOnly: true,
                                            sx: {
                                                fontSize: '0.83rem',
                                                borderRadius: '7px',
                                                backgroundColor: alpha('#f5f5f5', 0.5),
                                                color: theme.palette.text.secondary,
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#E2E8F0',
                                                },
                                            }
                                        }}
                                        placeholder="Auto-filled"
                                    />
                                </TableCell>

                                <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'white',
                                        border: `1px solid ${alpha('#000', 0.1)}`,
                                        borderRadius: 1,
                                        maxWidth: 160,
                                        mx: 'auto'
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleInputChange(
                                                row.id,
                                                'orderedQuantity',
                                                Math.max(0, (row.orderedQuantity || 0) - 1)
                                            )}
                                            sx={{
                                                color: SECONDARY_COLOR,
                                                '&:hover': { bgcolor: alpha(SECONDARY_COLOR, 0.1) }
                                            }}
                                        >
                                            <RemoveCircleOutlineIcon fontSize="small" />
                                        </IconButton>

                                        <TextField
                                            size="small"
                                            type="number"
                                            value={row.orderedQuantity}
                                            onChange={(e) => handleInputChange(
                                                row.id,
                                                'orderedQuantity',
                                                parseInt(e.target.value) || 0
                                            )}
                                            variant="standard"
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    width: 40,
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    input: { textAlign: 'center' },
                                                    '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                                                    '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                                }
                                            }}
                                        />

                                        <IconButton
                                            size="small"
                                            onClick={() => handleInputChange(
                                                row.id,
                                                'orderedQuantity',
                                                (row.orderedQuantity || 0) + 1
                                            )}
                                            sx={{
                                                color: PRIMARY_COLOR,
                                                '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.1) }
                                            }}
                                        >
                                            <AddCircleOutlineOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>

                                <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'white',
                                        border: `1px solid ${alpha('#000', 0.1)}`,
                                        borderRadius: 1,
                                        maxWidth: 160,
                                        mx: 'auto'
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleInputChange(
                                                row.id,
                                                'deliveredQuantity',
                                                Math.max(0, (row.deliveredQuantity || 0) - 1)
                                            )}
                                            sx={{
                                                color: SECONDARY_COLOR,
                                                '&:hover': { bgcolor: alpha(SECONDARY_COLOR, 0.1) }
                                            }}
                                        >
                                            <RemoveCircleOutlineIcon fontSize="small" />
                                        </IconButton>

                                        <TextField
                                            size="small"
                                            type="number"
                                            value={row.deliveredQuantity}
                                            onChange={(e) => handleInputChange(
                                                row.id,
                                                'deliveredQuantity',
                                                parseInt(e.target.value) || 0
                                            )}
                                            variant="standard"
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    width: 40,
                                                    textAlign: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    input: { textAlign: 'center' },
                                                    '& input[type=number]::-webkit-inner-spin-button': { display: 'none' },
                                                    '& input[type=number]::-webkit-outer-spin-button': { display: 'none' },
                                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                                }
                                            }}
                                        />

                                        <IconButton
                                            size="small"
                                            onClick={() => handleInputChange(
                                                row.id,
                                                'deliveredQuantity',
                                                (row.deliveredQuantity || 0) + 1
                                            )}
                                            sx={{
                                                color: PRIMARY_COLOR,
                                                '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.1) }
                                            }}
                                        >
                                            <AddCircleOutlineOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="text"
                                        value={formatNumberWithCommas(row.costPrice)}
                                        placeholder="Enter cost price"
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            const numeric = parseFloat(raw);
                                            if (!isNaN(numeric)) {
                                                handleInputChange(row.id, 'costPrice', numeric);
                                            } else if (e.target.value === '') {
                                                handleInputChange(row.id, 'costPrice', '');
                                            }
                                        }}
                                        InputProps={{
                                            sx: {
                                                fontSize: '0.83rem',
                                                borderRadius: '7px',
                                                backgroundColor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#E2E8F0',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha(PRIMARY_COLOR, 0.5),
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: 1.5,
                                                },
                                            }
                                        }}
                                    />
                                </TableCell>

                                <TableCell sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="text"
                                        value={formatNumberWithCommas(row.purchasePrice)}
                                        placeholder="Enter purchase price"
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, '');
                                            const numeric = parseFloat(raw);
                                            if (!isNaN(numeric)) {
                                                handleInputChange(row.id, 'purchasePrice', numeric);
                                            } else if (e.target.value === '') {
                                                handleInputChange(row.id, 'purchasePrice', '');
                                            }
                                        }}
                                        InputProps={{
                                            sx: {
                                                fontSize: '0.83rem',
                                                borderRadius: '7px',
                                                backgroundColor: 'white',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#E2E8F0',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha(PRIMARY_COLOR, 0.5),
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: PRIMARY_COLOR,
                                                    borderWidth: 1.5,
                                                },
                                            }
                                        }}
                                    />
                                </TableCell>

                                <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha('#000', 0.05)}`, py: 1.5 }}>
                                    <Tooltip
                                        title={stockRows.length === 1 ? "Cannot remove the last item" : "Remove item"}
                                        arrow
                                        TransitionComponent={Zoom}
                                    >
                                        <span>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveRow(row.id)}
                                                disabled={stockRows.length === 1}
                                                size="small"
                                                sx={{
                                                    '&:disabled': { opacity: 0.3 },
                                                    bgcolor: alpha('#f44336', 0.05),
                                                    '&:hover': { bgcolor: alpha('#f44336', 0.1) }
                                                }}
                                            >
                                                <RemoveCircleOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ mt: 0, mb: 0 }} />

            <Box sx={{ p: 3, bgcolor: alpha(PRIMARY_COLOR, 0.02) }}>
                <PriceTotals />
            </Box>
        </Paper>
    );
};

export default StockItems;