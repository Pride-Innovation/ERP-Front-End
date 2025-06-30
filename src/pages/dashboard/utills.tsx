/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography } from "@mui/material";
import { IStockDetails, IStockIndicatorProps } from "./interface";
import { requestMock } from "../../mocks/request";
import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { IRequest, IRequestTableData } from "../request/interface";
import { RequestContext } from "../../context/request/RequestContext";
import RequestUtills from "../request/assetRequest/utills";
import moment from "moment";

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
    const endPoint = 'requests';
    const header = { plural: 'Latest Requests', singular: 'Request' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setRequestTableData } = useContext(RequestContext);
    const { fetchAllRequests } = RequestUtills();
    const [loading, setLoading] = useState<boolean>(false)

    const {
        id,
        requester,
        name,
        description,
        status,
        timeOfSubmissionOfRequest,
        createDate,
        lastModified,
        createdBy,
        lastModifiedBy,
        priority,
        signaturePath,
        emailMessage,
        currentApprover,
        commodities: requestCommoditiesMocks,
        ...data
    } = requestMock[0];

    const rowData = {
        name: "",
        requestDate: "",
        priority: "",
        status: "",
        requester: "",
        currentApprover: "",
        ...data,
    };

    const handleRequest = (list: Array<IRequest>) => {
        const data: Array<IRequestTableData> = list.map((request, index) => {
            const {
                requester,
                name,
                description,
                status,
                timeOfSubmissionOfRequest,
                createDate,
                lastModified,
                createdBy,
                lastModifiedBy,
                signaturePath,
                currentApprover,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    name: request.name,
                    requestDate: moment(request.createDate as string).format("Do MMM YYYY"),
                    priority: request.priority,
                    status: request.status?.name,
                    requester: request.requester?.firstName ? `${request.requester.firstName} ${request.requester.lastName}` : "",
                    currentApprover: request.currentApprover?.firstName ? `${request.currentApprover?.firstName} ${request.currentApprover?.lastName}` : "",
                }
            )
        })
        setRequestTableData(data);
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData));
    }, []);


    const fetchLatestRequest = async () => {
        setLoading(true)
        const params = { pageSize: 5 }
        await fetchAllRequests(params)
        setLoading(false)
    }


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
            handleRequest,
            fetchLatestRequest,
            loading
        }
    )
}

export default DashBoardUtills