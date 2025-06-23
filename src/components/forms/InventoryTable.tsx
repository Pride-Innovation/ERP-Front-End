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
import { RowData } from './interface';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import EighteenMpOutlinedIcon from '@mui/icons-material/EighteenMpOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';

const InventoryTable = ({ issue, title }: { issue?: boolean, title: string }) => {
    const { fetchAllCommodities } = CommodityUtills()
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string, assetTypeId: number | string }[]>([]);
    const { rows, setRows, assetType } = useContext(RequestContext);
    const theme = useTheme();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    const handleInputChange = (id: number, field: keyof RowData, value: any) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updatedRows);
    };

    const handleAssetTypeNameChange = (id: number, value: string) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, assetTypeId: value } : row
        );
        setRows(updatedRows);

        const selectedType = assetTypes.find((asstyp) => asstyp.id === value);
        if (selectedType) {
            fetchAllCommodities({ assetTypeId: selectedType.id });
        }
    };

    const handleNameChange = (id: number, value: string) => {
        const selectedItem = commodities.find(item => item.name === value);

        if (!selectedItem) return;

        const updatedRows = rows.map(row =>
            row.id === id
                ? {
                    ...row,
                    name: value,
                    groupName: selectedItem.groupName,
                    commodityId: selectedItem.id as number,
                }
                : row
        );
        setRows(updatedRows);
    };

    const handleAddRow = () => {
        const newId = Date.now();
        setRows([
            ...rows,
            { id: newId, name: '', groupName: '', quantity: 0, commodityId: undefined },
        ]);
    };

    const handleRemoveRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    useEffect(() => {
        if (commodities && commodities.length > 0) {
            const options = commodities.map((item: any) => ({
                name: item.name,
                groupName: item.groupName,
                assetTypeId: item?.assetType?.id
            }));
            setItemOptions([...options, ...itemOptions]);
        }
    }, [commodities]);


    useEffect(() => {
        if (assetType.id) {
            fetchAllCommodities({ assetTypeId: assetType.id })
        }
    }, [assetType])


    /**
     * Handle Engraved Number additions
     */
    const optionalSelectOptions = commodities.map(c => c.name); // or any other source


    const handleSelectChange = (id: number, value: string[]) => {
        const updatedRows = rows.map(row =>
            row.id === id ? { ...row, selectedOptions: value } : row
        );
        setRows(updatedRows);
    };

    useEffect(() => {
        console.log(itemOptions, rows, "rows!!")
    }, [itemOptions])


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
                        color: "#007C7C",
                    }}
                >
                    {title}
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
                            {[
                                {
                                    name: 'Asset Type',
                                    icon: <AppRegistrationOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                                },
                                {
                                    name: 'Name',
                                    icon: <FeedOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                                },
                                {
                                    name: "Unit of Measure",
                                    icon: <ScaleOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                                },
                                {
                                    name: "Quantity",
                                    icon: <EighteenMpOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                                },
                                ...(issue
                                    ? [{
                                        name: "Engraved Nos.",
                                        icon: <FeedOutlinedIcon sx={{ fontSize: "12px", mr: "5px" }} />
                                    }]
                                    : []),
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
                                        borderRight: idx !== 7 ? '1px solid rgba(224, 224, 224, 1)' : 'none',
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
                        {rows.map((row, index) => (
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
                                        value={row.assetTypeId || ""}
                                        onChange={(e) => handleAssetTypeNameChange(row.id, e.target.value as string)}
                                        displayEmpty
                                        size="small"
                                        variant="standard"
                                        disableUnderline
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 400,
                                            color: row.assetTypeId ? 'text.primary' : 'text.secondary',
                                            '& .MuiSelect-select': {
                                                padding: '8px 12px',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#999',
                                            },
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
                                        {itemOptions
                                            .filter(ele => ele.assetTypeId === row.assetTypeId)
                                            .map((item) => (
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
                                        value={row.quantity}
                                        variant="standard"
                                        onChange={(e) =>
                                            handleInputChange(row.id, 'quantity', parseInt(e.target.value) || 0)
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
                                                            handleInputChange(row.id, 'quantity', row.quantity - 1)
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
                                                            handleInputChange(row.id, 'quantity', row.quantity + 1)
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

                                {/* Handle Engraved numbers */}

                                {issue && <TableCell sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <Select
                                        multiple
                                        displayEmpty
                                        fullWidth
                                        variant="standard"
                                        disableUnderline
                                        value={row.selectedOptions || []}
                                        onChange={(e) =>
                                            handleSelectChange(row.id, typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
                                        }
                                        renderValue={(selected) => {
                                            if (!selected.length) return <em>Select tags</em>;
                                            return (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((value: string, idx) => (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                color: theme.palette.primary.main,
                                                                px: 1.2,
                                                                py: 0.5,
                                                                borderRadius: 1.5,
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {value}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            );
                                        }}
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: 400,
                                            color: 'text.primary',
                                            '& .MuiSelect-select': {
                                                padding: '8px 12px',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: '#999',
                                            },
                                        }}
                                    >
                                        {optionalSelectOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>}

                                <TableCell align="center" sx={{ borderBottom: 'none', px: 2, py: 1 }}>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={rows.length === 1}
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

export default InventoryTable;
