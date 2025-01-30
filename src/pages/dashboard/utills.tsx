import { Box, Typography } from "@mui/material";
import { IStockDetails, IStockIndicatorProps } from "./interface";
import { requestMock } from "../../mocks/request";
import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { IRequest, IRequestTableData } from "../request/interface";
import { RequestContext } from "../../context/request/RequestContext";

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
    const header = { plural: 'Latest Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setRequestTableData } = useContext(RequestContext)

    const {
        id,
        requester,
        name,
        desc,
        ...data
    } = requestMock[0];

    const rowData = {
        name: `${requestMock[0].requester?.firstName} ${requestMock[0].requester?.lastName}`,
        department: requestMock[0].requester?.department,
        ...data,
    };

    const handleRequest = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
            const {
                requester,
                name,
                ...fielsdata
            } = list[index];

            return (
                {
                    name: `${request.requester?.firstName} ${request.requester?.lastName}`,
                    department: request.requester?.department,
                    ...fielsdata
                }
            )
        })
        setRequestTableData(data);
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData));
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
            columnHeaders,
            handleRequest
        }
    )
}

export default DashBoardUtills