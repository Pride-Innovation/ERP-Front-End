/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import {
    Grid,
    Stack,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Card,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import { RowData } from "../../../../components/forms/interface";
import { IRequest, IRequestAxiosResponse } from "../../interface";
import { RequestContext } from "../../../../context/request/RequestContext";
import { ICommodity } from "../../../settings/commodity/interface";
import {
    findAssetRequestByIDService,
    issueCommodities
} from "../service";
import {
    validateAssetsOfItems,
    validateCommodityQuantities,
    validateInventoryItems
} from "../../../../utils/helpers";
import InventoryTable from "../../../../components/forms/InventoryTable";
import ButtonComponent from "../../../../components/forms/Button";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { IIssueAxiosResponse } from "./interface";

const initialData: RowData[] = [
    { id: 1, name: '', groupName: '', quantity: 0 },
];

const IssueRequestDetails = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { rows, setRows } = useContext(RequestContext);
    const [request, setRequest] = useState<IRequest>({} as IRequest)
    const { id } = useParams<{ id: string }>();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const navigate = useNavigate();

    const [requestCommodities, setRequestCommodities] = useState<
        Array<{ commodity: ICommodity; quantity: number }>
    >([]);

    useEffect(() => { setRows(initialData) }, []);

    const fetchRequestByID = async () => {
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                setRequest(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => { fetchRequestByID() }, [])

    const fetchRequestCommodities = async () => {
        setLoading(true);
        try {
            const response = (await findAssetRequestByIDService(
                request.id as number
            )) as IRequestAxiosResponse;

            if (
                response.status === 200 &&
                (response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>)?.length > 0
            ) {
                setRequestCommodities(response.data.commodities as Array<{ commodity: ICommodity; quantity: number }>);
            } else {
                setRequestCommodities([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load commodities.");
            setRequestCommodities([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (request && request.id) {
            fetchRequestCommodities();
        }
    }, [request]);

    const handleRequestRejection = async () => {
        setSendingRequest(true);

        const result = validateInventoryItems(rows);
        const validate = validateCommodityQuantities(requestCommodities, rows);
        const countValidation = validateAssetsOfItems(rows, assetTypes)

        if (result.isValid
            && result.validData
            && validate.isValid
            && countValidation.isValid
        ) {

            const formattedCommodities = result.validData.map(item => ({
                commodityId: item.id,
                quantity: item.quantity
            }));

            const assets = countValidation.validData?.map(asst => [...(asst.selectedAssets ?? [])])
                .flat().map(asst => ({
                    id: asst.id,
                    engravedNumber: asst.engravedNumber
                }));

            const data = {
                requester: request.requester?.id,
                commodities: formattedCommodities,
                comment: "",
                assets,
                requestId: id
            }

            try {
                /**
                 * TO DO --- Make an API call
                 */
                const response = await issueCommodities(data) as IIssueAxiosResponse;
                if (response.status === 201) {
                    toast.success("Request Issued Successfully")
                }
            } catch (error) {
                console.log(error)
            }

        } else {
            setSendingRequest(false);
            if (result.errors.length > 0) {
                return toast.error(`Requests validation errors: ${result.errors}`)
            }
            if (validate.errors.length > 0) {
                return toast.error(`Requests validation errors: ${validate.errors}`)
            }
            if (countValidation.errors.length > 0) {
                return toast.error(`Requests validation errors: ${countValidation.errors}`)
            }
        }
        setSendingRequest(false);
    }

    return (
        <>
            <Card sx={{ p: 4, boxShadow: "none" }}>
                <Grid container spacing={4}>
                    <Grid xs={12} item container>
                        <Grid item xs={6}>
                            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                                Request Details:
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Are you sure you want to Issue this request items?
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <InventoryOutlinedIcon color="primary" />
                                <Typography variant="h6" color="primary">
                                    {request.name}
                                </Typography>
                            </Stack>
                            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                                {request.description}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                                <Person2OutlinedIcon color="primary" />
                                <Typography variant="h6" color="primary">
                                    Requested By: {request.requester?.firstName} {request.requester?.lastName}
                                </Typography>
                            </Stack>
                            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                                From: {request.requester?.title?.branch?.name}
                            </Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <Card sx={{ p: 3, boxShadow: 0, border: `1px solid #E5F2F2`, }}>
                                <Typography variant="subtitle1" sx={{ mb: 1, color: theme.palette.secondary.main }}>
                                    Requested Commodities
                                </Typography>
                                {loading ? (
                                    <Stack alignItems="center" sx={{ mt: 2 }}>
                                        <CircularProgress size={24} />
                                        <Typography variant="caption" sx={{ mt: 1 }}>
                                            Loading commodities...
                                        </Typography>
                                    </Stack>
                                ) : requestCommodities.length > 0 ? (
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
                                                {requestCommodities.map((item, idx) => (
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
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No commodities found for this request.
                                    </Typography>
                                )}
                            </Card>
                        </Grid>
                    </Grid>
                </Grid >
            </Card>
            <Card sx={{ boxShadow: "none", mt: 3, borderRadius: 2, p: 4 }}>
                <Grid xs={12} item container>
                    <Card
                        sx={{
                            width: '100%',
                            bgcolor: 'white',
                            p: 3,
                            borderRadius: 2,
                            boxShadow: 0,
                            border: `1px solid #E5F2F2`,
                        }}
                    >
                        <Grid xs={12} item container>
                            <Grid item xs={12}>
                                <InventoryTable issue title="Issue Items" />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Stack direction="row" spacing={3} sx={{ width: "30%" }}>
                        <ButtonComponent
                            handleClick={() => { navigate(-1); }}
                            buttonColor="info"
                            type="button"
                            variant="outlined"
                            sendingRequest={false}
                            buttonText="Back"
                        />
                        <ButtonComponent
                            handleClick={handleRequestRejection}
                            buttonColor="primary"
                            type="submit"
                            sendingRequest={sendingRequest}
                            buttonText="Issue Items"
                        />
                    </Stack>
                </Grid>
            </Card>
        </>
    );
}

export default IssueRequestDetails
