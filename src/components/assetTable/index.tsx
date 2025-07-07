import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useTheme
} from '@mui/material';
import { ICommodity } from '../../pages/settings/commodity/interface';

interface ICommoditiesItem {
    commodities: Array<{ commodity: ICommodity; quantity: number }>
}

const AssetTable = ({ commodities }: ICommoditiesItem) => {
    const theme = useTheme();
    return (
        <Paper
            elevation={0}
            sx={{ bgcolor: "transparent" }}
        >
            <Table
                size="small"
                sx={{ borderCollapse: "separate", borderSpacing: 0 }}
            >
                <TableHead>
                    <TableRow
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            "& th": {
                                borderBottom: "none",
                                color: theme.palette.background.paper
                            },
                        }}
                    >
                        <TableCell>Commodity</TableCell>
                        <TableCell>Unit of Measure</TableCell>
                        <TableCell>Asset Type</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {commodities.map((item, idx) => (
                        <TableRow
                            key={idx}
                            sx={{
                                backgroundColor:
                                    idx % 2 === 0
                                        ? theme.palette.action.hover
                                        : "transparent",
                                "& td": {
                                    borderBottom: "none",
                                },
                            }}
                        >
                            <TableCell>{item.commodity.name}</TableCell>
                            <TableCell>{item.commodity.groupName}</TableCell>
                            <TableCell>{item.commodity.assetType?.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default AssetTable;