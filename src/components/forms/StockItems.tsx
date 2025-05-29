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
    InputAdornment,
    useTheme,
    alpha,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CommodityUtills from '../../pages/settings/commodity/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RequestContext } from '../../context/request/RequestContext';
import { StockRowData } from './interface';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import EighteenMpOutlinedIcon from '@mui/icons-material/EighteenMpOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const StockItems = () => {
    const { fetchAllCommodities } = CommodityUtills()
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string }[]>([]);
    const { stockRows, setStockRows } = useContext(RequestContext);
    const theme = useTheme();

    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    useEffect(() => { fetchAllCommodities() }, [])

    const handleInputChange = (id: number, field: keyof StockRowData, value: any) => {
        const updatedRows = stockRows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setStockRows(updatedRows);
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
            }));
            setItemOptions(options);
        }
    }, [commodities]);

    const formatNumberWithCommas = (value: number | string): string => {
        if (value === '' || isNaN(Number(value))) return '';
        return Number(value).toLocaleString('en-UG');
    };

    const parseFormattedNumber = (value: string): number => {
        const cleaned = value.replace(/,/g, '');
        return parseFloat(cleaned);
    };

    return (
        <Paper elevation={4} sx={{
            borderRadius: 2, boxShadow: "none",
        }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                sx={{
                    bgcolor: alpha("#007C7C", 0.1),
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha("#007C7C", 0.3)}`,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "15px",
                        textTransform: "capitalize",
                        color: "#007C7C", // consistent with transparent background
                    }}
                >
                    Stock Items
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    color="secondary"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    Add Item
                </Button>
            </Box>

            <TableContainer component={Box} sx={{ borderRadius: 2, border: 'none' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow
                            sx={{
                                backgroundColor: '#CACACA',
                            }}
                        >
                            {[{
                                name: 'Name',
                                icon: <FeedOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Measure",
                                icon: <ScaleOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Ordered Qty",
                                icon: <EighteenMpOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Delivered Qty",
                                icon: <ShoppingCartOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Cost Price",
                                icon: <AttachMoneyIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Purchase Price",
                                icon: <MonetizationOnOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            },
                            {
                                name: "Remove",
                                icon: <RemoveCircleOutlineOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                            }
                            ].map((header, idx) => (
                                <TableCell
                                    key={header?.name}
                                    align={idx === 3 ? 'center' : 'left'}
                                    sx={{
                                        color: 'teal',
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize',
                                        fontSize: 14,
                                        borderBottom: 'none',
                                        borderRight: idx !== 8 ? '1px solid rgba(224, 224, 224, 1)' : 'none',
                                        px: 2,
                                        py: 1.5,
                                    }}
                                >
                                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                                        {header?.icon}
                                        {header?.name}
                                    </Typography>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stockRows.map((row, index) => (
                            <TableRow
                                key={row.id}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#F1F1F1',
                                    },
                                    '&:last-child td, &:last-child th': { border: 0 },
                                }}
                            >
                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <Select
                                        fullWidth
                                        value={row.name}
                                        onChange={(e) => handleNameChange(row.id, e.target.value)}
                                        displayEmpty
                                        size="small"
                                        variant="standard"
                                        disableUnderline
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 400,
                                            color: row.name ? 'text.primary' : 'text.secondary',
                                            '& .MuiSelect-select': {
                                                padding: '8px 12px',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#999',
                                            },
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Select Item</em>
                                        </MenuItem>
                                        {itemOptions.map((item) => (
                                            <MenuItem key={item.name} value={item.name}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.groupName}
                                        InputProps={{
                                            readOnly: true,
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: 14,
                                                borderRadius: 2,
                                                px: 1.5,
                                            },
                                        }}
                                        variant="standard"
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        fullWidth
                                        value={row.orderedQuantity}
                                        variant="standard"
                                        onChange={(e) =>
                                            handleInputChange(row.id, 'orderedQuantity', parseInt(e.target.value) || 0)
                                        }
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: 14,
                                                borderRadius: 2,
                                                px: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                '& input[type=number]::-webkit-inner-spin-button': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]::-webkit-outer-spin-button': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]': {
                                                    MozAppearance: 'textfield',
                                                },
                                            },
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleInputChange(row.id, 'orderedQuantity', row.orderedQuantity - 1)
                                                        }
                                                        sx={{ p: 0.5, mr: 3 }}
                                                    >
                                                        <RemoveCircleOutlineIcon fontSize="small" color='secondary' />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleInputChange(row.id, 'orderedQuantity', row.orderedQuantity + 1)
                                                        }
                                                        sx={{ p: 0.5 }}
                                                    >
                                                        <AddCircleOutlineOutlinedIcon fontSize="small" color='primary' />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        fullWidth
                                        value={row.deliveredQuantity}
                                        variant="standard"
                                        onChange={(e) =>
                                            handleInputChange(row.id, 'deliveredQuantity', parseInt(e.target.value) || 0)
                                        }
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: 14,
                                                borderRadius: 2,
                                                px: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                '& input[type=number]::-webkit-inner-spin-button': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]::-webkit-outer-spin-button': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]': {
                                                    MozAppearance: 'textfield',
                                                },
                                            },
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleInputChange(row.id, 'deliveredQuantity', row.deliveredQuantity - 1)
                                                        }
                                                        sx={{ p: 0.5, mr: 3 }}
                                                    >
                                                        <RemoveCircleOutlineIcon fontSize="small" color='secondary' />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleInputChange(row.id, 'deliveredQuantity', row.deliveredQuantity + 1)
                                                        }
                                                        sx={{ p: 0.5 }}
                                                    >
                                                        <AddCircleOutlineOutlinedIcon fontSize="small" color='primary' />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <TextField
                                        size="small"
                                        type="text"
                                        fullWidth
                                        value={formatNumberWithCommas(row.costPrice)}
                                        placeholder="Type here ..."
                                        variant="standard"
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
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: 14,
                                                borderRadius: 2,
                                                px: 1.5,
                                            },
                                        }}
                                    />
                                </TableCell>

                                <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <TextField
                                        size="small"
                                        type="text"
                                        fullWidth
                                        value={formatNumberWithCommas(row.purchasePrice)}
                                        placeholder="Type here ..."
                                        variant="standard"
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
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: 14,
                                                borderRadius: 2,
                                                px: 1.5,
                                            },
                                        }}
                                    />

                                </TableCell>

                                <TableCell align="center" sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={stockRows.length === 1}
                                        sx={{ '&:disabled': { opacity: 0.3 } }}
                                    >
                                        <RemoveCircleOutlineIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Paper>
    );
};

export default StockItems;
