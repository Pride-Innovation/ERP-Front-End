/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Grid,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import { grey } from "@mui/material/colors";
import ButtonComponent from "../../../../components/forms/Button";
import PlaceHolder from "../../../../statics/images/Placeholder.png"
import { useNavigate, useParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import { IRequest, IRequestAxiosResponse, IRequestReport } from "../../interface";
import { findAssetRequestByIDService } from "../service";
import DetailSection from "../../../assets/trails/DetailSection";
import ChipComponent from "../../../../components/forms/Chip";
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import TabComponent from "../../../../components/tabs";
import OtherDetails from "./OtherDetails";
import RequestCommodties from "./RequestCommodties";
import { ICommodity } from "../../../settings/commodity/interface";
import RequestReports from "./RequestReports";
import RequestUtills from "../utills";
import { RequestContext } from "../../../../context/request/RequestContext";


const RequestDetails = () => {
    const [request, setRequest] = useState<IRequest>({} as IRequest);
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const {
        acknowledgeIssuance,
        acknowledgeRequest,
        issuanceApproval,
        currentIssuance
    } = useContext(RequestContext);

    const navigate = useNavigate();
    const {
        findAcknowledgeIssuanceReceiptByRequestId,
        findAcknowledgeRequestReceiptByRequestId,
        findIssuanceApprovalRecordByRequestId,
        fetchIssuanceByRequestId
    } = RequestUtills();

    const fetchRequestDetails = async () => {
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                setRequest(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (id) { fetchRequestDetails() }
    }, [id]);

    useEffect(() => {
        if (request.id) {
            findAcknowledgeIssuanceReceiptByRequestId(request.id as number);
            findAcknowledgeRequestReceiptByRequestId(request.id as number);
            findIssuanceApprovalRecordByRequestId(request.id as number);
            fetchIssuanceByRequestId(request.id as number);
        }
    }, [request]);

    const determinePriority = (
        request?.priority === "high" ?
            <ChipComponent variant='filled' label='High' icon={
                <AccessAlarmsIcon
                    fontSize='small' />
            } size='medium' color='error' /> :
            request?.priority === "medium" ?
                <ChipComponent variant='filled' label='Medium'
                    icon={
                        <DoNotDisturbAltIcon
                            fontSize='small' />
                    } size='medium' color='secondary' /> :
                <ChipComponent variant='filled' label='Low' icon={
                    <SpeedIcon
                        fontSize='small'
                        sx={{ color: theme.palette.background.paper }}
                    />}
                    size='medium'
                    color='success'
                />
    )

    return (
        <Card sx={{ p: 4, boxShadow: "none" }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <Box sx={{ height: "250px", position: "relative" }}>
                            <CardMedia
                                component="img"
                                height="250px"
                                image={PlaceHolder}
                                alt="Equipment Image"
                            />
                            <Box sx={{ position: "absolute", bottom: 20, right: 20, width: "40%" }}>
                                <ButtonComponent
                                    sendingRequest={false}
                                    buttonText="View Attachment"
                                    variant="contained"
                                    buttonColor="secondary"
                                    handleClick={() => console.log("Button Clicked")} />
                            </Box>
                        </Box>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
                                {request?.name}
                            </Typography>
                            <Divider />
                            <DetailSection label='Requested By' text={`${request?.requester?.firstName} ${request.requester?.lastName}` as string} />
                            {request.priority && <DetailSection label="Priority" text={request?.priority as string} chip={determinePriority} />}
                            {request?.status && <DetailSection label="Status" text={request?.status.status as string} />}
                            {request?.description && <DetailSection label="Description" text={request?.description} />}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardContent>
                            <TabComponent
                                headers={[
                                    {
                                        label: "Other Details",
                                        position: 0,
                                        content: <OtherDetails
                                            acknowledgeIssuance={acknowledgeIssuance}
                                            acknowledgeRequest={acknowledgeRequest}
                                            issuanceApproval={issuanceApproval}
                                            issuance={currentIssuance}
                                            request={request} />
                                    },
                                    {
                                        label: "Request Commodities",
                                        position: 1,
                                        content: <RequestCommodties requestCommodties={
                                            request.commodities as Array<{
                                                commodity: ICommodity
                                                quantity: number
                                            }>} />
                                    },
                                    {
                                        label: "Request Reports",
                                        position: 2,
                                        content: <RequestReports requestReports={request.requestReports as Array<IRequestReport>} />
                                    }
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Box sx={{ width: "30%", display: "flex", justifyContent: "end", ml: "auto", mt: 3 }}>
                <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                    <ButtonComponent
                        buttonColor='info'
                        type='submit'
                        variant="outlined"
                        sendingRequest={false}
                        handleClick={() => navigate(-1)}
                        buttonText="Back" />
                </Stack>
            </Box>
        </Card>
    )
}

export default RequestDetails