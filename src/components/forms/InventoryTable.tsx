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
    useTheme,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import CommodityUtills from '../../pages/settings/commodity/utills';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { RequestContext } from '../../context/request/RequestContext';
import { RowData } from './interface';

// const initialData: RowData[] = [
//     { id: 1, name: '', groupName: '', quantity: 0 },
// ];

const InventoryTable = () => {
    const { fetchAllCommodities } = CommodityUtills()
    const [itemOptions, setItemOptions] = useState<{ name: string; groupName: string }[]>([]);
    const { rows, setRows } = useContext(RequestContext);

    const theme = useTheme();
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);

    useEffect(() => { fetchAllCommodities() }, [])

    const handleInputChange = (id: number, field: keyof RowData, value: any) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updatedRows);
    };

    const handleNameChange = (id: number, value: string) => {
        const selectedItem = itemOptions.find(item => item.name === value);
        const group = selectedItem?.groupName || '';
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, name: value, groupName: group } : row
        );
        setRows(updatedRows);
    };
    const handleAddRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        setRows([...rows, { id: newId, name: '', groupName: '', quantity: 0 }]);
    };

    const handleRemoveRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
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

    return (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, boxShadow: "none", border: "1px solid #C9C9C9" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    fontSize: "16px",
                    textTransform: "uppercase"
                }}>
                    Request Items
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRow}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': {
                            backgroundColor: '#065f55',
                        },
                        color: theme.palette.background.paper,
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    Add Item
                </Button>
            </Box>
            <TableContainer component={Box}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#BC892C' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Group</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                                Remove
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>
                                    <Select
                                        fullWidth
                                        value={row.name}
                                        onChange={(e) => handleNameChange(row.id, e.target.value)}
                                        displayEmpty
                                        size="small"
                                        sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                    >
                                        <MenuItem value="" disabled>Select Item</MenuItem>
                                        {itemOptions.map((item) => (
                                            <MenuItem key={item.name} value={item.name}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.groupName}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={row.quantity}
                                        onChange={(e) =>
                                            handleInputChange(row.id, 'quantity', parseInt(e.target.value) || 0)
                                        }
                                        sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={rows.length === 1}
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
