/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
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

type ItemName = 'Book' | 'Pen' | 'Notebook' | 'Computer';

const itemGroups: Record<ItemName, string> = {
    Book: 'Dozen',
    Pen: 'Pack',
    Notebook: 'Piece',
    Computer: 'Piece',
};

interface RowData {
    id: number;
    name: ItemName | '';
    group: string;
    quantity: number;
}

const initialData: RowData[] = [
    { id: 1, name: '', group: '', quantity: 0 },
];

const InventoryTable = () => {
    const [rows, setRows] = useState<RowData[]>(initialData);
    const theme = useTheme();

    const handleInputChange = (id: number, field: keyof RowData, value: any) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updatedRows);
    };

    const handleNameChange = (id: number, value: ItemName) => {
        const group = itemGroups[value];
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, name: value, group } : row
        );
        setRows(updatedRows);
    };

    const handleAddRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        setRows([...rows, { id: newId, name: '', group: '', quantity: 0 }]);
    };

    const handleRemoveRow = (id: number) => {
        setRows(rows.filter((row) => row.id !== id));
    };

    return (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 2, bgcolor: '#FFFFFF' }}>
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
                                        onChange={(e) => handleNameChange(row.id, e.target.value as ItemName)}
                                        displayEmpty
                                        size="small"
                                        sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                    >
                                        <MenuItem value="" disabled>Select Item</MenuItem>
                                        {(Object.keys(itemGroups) as ItemName[]).map((item) => (
                                            <MenuItem key={item} value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.group}
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
