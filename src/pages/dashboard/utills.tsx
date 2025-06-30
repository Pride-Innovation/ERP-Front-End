/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography } from "@mui/material";
import {
    IDashboardAssetCard,
    IDashboardAssetReport,
    IDashboardAssetReportAxiosResponse,
    IStockDetails,
    IStockIndicatorProps
} from "./interface";
import { requestMock } from "../../mocks/request";
import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { IRequest, IRequestTableData } from "../request/interface";
import { RequestContext } from "../../context/request/RequestContext";
import RequestUtills from "../request/assetRequest/utills";
import moment from "moment";
import { assetTypesStatusConstants, crudStates } from "../../utils/constants";
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import Laptop from "../../statics/images/computer-removebg-preview.png";
import Furniture from "../../statics/images/chair-office-removebg-preview.png";
import Books from "../../statics/images/Archives-removebg-preview.png";
import Vehicle from "../../statics/images/car-image-removebg-preview.png";
import { fetchDashboardAssetReportService } from "./service";

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
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
    const [assetReports, setAssetReports] = useState<Array<IDashboardAssetReport>>([])
    const [assetCards, setAssetCards] = useState<Array<IDashboardAssetCard>>([])

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
        approver: "",
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.approve, label: "Approve", icon: <ModeEditOutlineOutlinedIcon fontSize='small' color='info' /> }
            ]
        },
    };

    const listDashboardAssetReport = (list: IDashboardAssetReport[]): Array<IDashboardAssetCard> => {

        return list.map((ele) => ({
            name: ele.assetTypeName,
            image: ele.assetTypeName === assetTypesStatusConstants.itEquipment ? Laptop :
                ele.assetTypeName === assetTypesStatusConstants.officeEquipment ? Furniture :
                    ele.assetTypeName === assetTypesStatusConstants.fleet ? Vehicle : Books
            ,
            stockLevel: ele.totalCount > 10 ? "normal" :
                ele.totalCount >= 5 && ele.totalCount < 10 ? "average" : "low",
            number: ele.totalCount,
            date: ele.lastUpdatedDate
        }))

    }

    useEffect(() => {
        if (assetReports.length > 0) {
            setAssetCards(listDashboardAssetReport(assetReports))
        }
    }, [assetReports])


    const fetchDashboardAssetReport = async () => {
        setLoadingAssets(true)
        try {
            const response = await fetchDashboardAssetReportService() as IDashboardAssetReportAxiosResponse;
            if (response.status === 200) {
                setAssetReports(response.data)
            }
        } catch (error) {
            console.log(error)
        }
        setLoadingAssets(false)
    }


    useEffect(() => {
        fetchDashboardAssetReport()
    }, [])

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
                    approver: request.currentApprover?.firstName ? `${request.currentApprover?.firstName} ${request.currentApprover?.lastName}` : "",
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
            loading,
            assetCards,
            loadingAssets
        }
    )
}

export default DashBoardUtills