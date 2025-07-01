/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Typography } from "@mui/material";
import {
    BarChartData,
    IDashboardAssetCard,
    IDashboardAssetReport,
    IDashboardAssetReportAxiosResponse,
    IMonthlyAssetReport,
    IMonthlyAssetReportAxiosResponse,
    IStationeryReportAxiosResponse,
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
import Laptop from "../../statics/images/icons8-laptop-96.png";
import Furniture from "../../statics/images/icons8-chair-67.png";
import Books from "../../statics/images/Archives-removebg-preview.png";
import Vehicle from "../../statics/images/icons8-car-64.png";
import {
    fetchDashboardAssetReportService,
    fetchMonthlyStockingReportService,
    fetchStationeryDataReportService
} from "./service";

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
    const { setRequestTableData, setMonthlyStockingReport } = useContext(RequestContext);
    const { fetchAllRequests } = RequestUtills();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
    const [assetReports, setAssetReports] = useState<Array<IDashboardAssetReport>>([])
    const [assetCards, setAssetCards] = useState<Array<IDashboardAssetCard>>([]);
    const [assetCardsWithStationery, setAssetCardsWithStationery] = useState<Array<IDashboardAssetReport>>([]);
    const [chartData, setChartData] = useState<Array<number>>([])
    const labels = [
        assetTypesStatusConstants.itEquipment,
        assetTypesStatusConstants.officeEquipment,
        assetTypesStatusConstants.fleet,
        assetTypesStatusConstants.stationery
    ];

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

    const fetchStationeryDataReport = async () => {
        setLoadingAssets(true)
        try {
            const response = await fetchStationeryDataReportService() as IStationeryReportAxiosResponse;
            if (response.status === 200) {
                setAssetCardsWithStationery([...assetReports, response.data])
            }
        } catch (error) {
            console.log(error)
        }
        setLoadingAssets(false)
    }

    useEffect(() => { fetchStationeryDataReport() }, [assetReports])

    useEffect(() => {
        if (assetCardsWithStationery.length > 0) {
            setAssetCards(listDashboardAssetReport(assetCardsWithStationery))
        }
    }, [assetCardsWithStationery])


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

    const fetchMonthlyStockingReport = async () => {
        setLoadingAssets(true)
        try {
            const response = await fetchMonthlyStockingReportService() as IMonthlyAssetReportAxiosResponse;
            if (response.status === 200) {
                setMonthlyStockingReport(response.data)
            }
        } catch (error) {
            console.log(error)
        }
        setLoadingAssets(false)
    }

    useEffect(() => {
        fetchDashboardAssetReport();
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
                    requester: request.requester?.firstName ?
                        `${request.requester.firstName} ${request.requester.lastName}` : "",
                    approver: request.currentApprover?.firstName ?
                        `${request.currentApprover?.firstName} ${request.currentApprover?.lastName}` : "",
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

    const setDoghnutChartData = (data: IDashboardAssetCard[]) => {
        const res: Array<number> = []
        data.forEach(ele => {
            if (ele.name === assetTypesStatusConstants.itEquipment) {
                res[0] = ele.number
            }
            if (ele.name === assetTypesStatusConstants.officeEquipment) {
                res[1] = ele.number
            }
            if (ele.name === assetTypesStatusConstants.fleet) {
                res[2] = ele.number
            }
            if (ele.name === assetTypesStatusConstants.stationery) {
                res[3] = ele.number
            }
        })
        setChartData(res);
    }

    useEffect(() => {
        if (assetCards.length > 0) {
            setDoghnutChartData(assetCards)
        }
    }, [assetCards])

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

    function transformToBarChartData(summary: IMonthlyAssetReport[]): BarChartData[] {
        const assetTypes = [
            { key: 'itEquipment', label: 'IT Equipment', backgroundColor: '#08796C' },
            { key: 'officeEquipment', label: 'Office Equipment', backgroundColor: '#5A005C' },
            { key: 'fleet', label: 'Fleet', backgroundColor: '#BC892C' },
            { key: 'stationery', label: 'Stationery', backgroundColor: '#000068' },
        ];

        return assetTypes.map(asset => ({
            label: asset.label,
            data: summary.map(month => Number(month[asset.key as keyof IMonthlyAssetReport]) || 0),
            backgroundColor: asset.backgroundColor,
        }));
    }

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
            loadingAssets,
            chartData,
            labels,
            fetchMonthlyStockingReport,
            transformToBarChartData
        }
    )
}

export default DashBoardUtills