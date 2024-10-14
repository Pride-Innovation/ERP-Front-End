import { Box, Typography } from "@mui/material";
import { IStockDetails, IStockIndicatorProps } from "./interface";
import { requestMock } from "../../mocks/request";
import { useEffect, useState } from "react";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";

const style = {
    bgcolor: '#ffffff',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}

const DashBoardUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const {
        id,
        particulars,
        title,
        department,
        reason,
        ...data
    } = requestMock[0];

    const rowData = {

        ...data,
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const getStockDetails = (stockLevel: string): IStockDetails => {
        switch (stockLevel) {
            case 'low':
                return { color: 'red', status: 'Required' };
            case 'average':
                return { color: 'orange', status: 'Average Stock' };
            default:
                return { color: 'green', status: 'Plenty in Stock' };
        }
    };

    const StockIndicator: React.FC<IStockIndicatorProps> = ({ color }) => (
        <Box
            sx={{
                ...style,
                border: `2px solid ${color}`,
            }}
        >
            <Typography sx={{ fontSize: "20px" }} variant="caption" color={color}>
                !
            </Typography>
        </Box>
    );

    return (
        {
            getStockDetails,
            StockIndicator,
            endPoint,
            header,
            columnHeaders
        }
    )
}

export default DashBoardUtills

