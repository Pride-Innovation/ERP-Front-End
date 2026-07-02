/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    ReactNode,
    useContext,
    useEffect,
    useState
} from "react";
import {
    Box,
    Stack,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Divider,
    Chip,
    Avatar,
    Button as MuiButton,
    alpha,
} from "@mui/material";
import { toast } from "react-toastify";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { IIssueAxiosResponse } from "./interface";
import { brand, gold, neutral, border, surface } from "../../../../utils/tokens";
import { PageSection } from "../../../../components/layout";

const initialData: RowData[] = [
    { id: 1, name: '', groupName: '', quantity: 0 },
];

const cardSx = {
    bgcolor: '#fff',
    border: `1px solid ${border.subtle}`,
    borderRadius: 2.5,
    p: { xs: 2, md: 3 },
    mb: 2.5,
};

const StatTile = ({ value, label }: { value: ReactNode; label: string }) => (
    <Box
        sx={{
            px: 2,
            py: 1.25,
            bgcolor: '#fff',
            border: `1px solid ${border.subtle}`,
            borderRadius: 1.5,
            textAlign: 'center',
            minWidth: 86,
        }}
    >
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: neutral[900], lineHeight: 1 }}>
            {value}
        </Typography>
        <Typography
            sx={{
                fontSize: '0.58rem',
                fontWeight: 700,
                color: neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                mt: 0.7,
            }}
        >
            {label}
        </Typography>
    </Box>
);

const MetaItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: alpha(brand[500], 0.08),
                color: brand[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: neutral[800] }}>
                {value}
            </Typography>
        </Box>
    </Stack>
);

const IssueRequestDetails = () => {
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

    const totalQty = requestCommodities.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    const firstName = request.requester?.firstName ?? '';
    const lastName = request.requester?.lastName ?? '';
    const requesterName = `${firstName} ${lastName}`.trim() || 'Unknown requester';
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '—';
    const branchName = request.requester?.branch?.name ?? '—';

    return (
        <Box sx={{ maxWidth: 1180, mx: 'auto', pb: 6, px: { xs: 1, sm: 0 } }}>
            {/* Back link */}
            <Box
                onClick={() => navigate(-1)}
                sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', mb: 2,
                    px: 1.25, py: 0.6, borderRadius: 1.5, color: brand[600],
                    border: `1px solid ${alpha(brand[500], 0.25)}`, bgcolor: alpha(brand[500], 0.04),
                    transition: 'all .18s ease',
                    '&:hover': { bgcolor: alpha(brand[500], 0.09), borderColor: alpha(brand[500], 0.4) },
                }}
            >
                <ArrowBackIcon sx={{ fontSize: 15 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Back</Typography>
            </Box>

            {/* Hero */}
            <Box
                sx={{
                    position: 'relative', borderRadius: 2.5, border: `1px solid ${border.subtle}`,
                    background: `linear-gradient(135deg, ${alpha(brand[50], 0.7)} 0%, #FFFFFF 60%)`,
                    overflow: 'hidden', mb: 2.5,
                }}
            >
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${brand[500]}, ${brand[700]})` }} />
                <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'flex-start' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box sx={{ width: 54, height: 54, borderRadius: 2, bgcolor: alpha(brand[500], 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <LocalShippingOutlinedIcon sx={{ color: brand[600], fontSize: 27 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }} flexWrap="wrap" useFlexGap>
                                    <Typography variant="overline" sx={{ color: brand[700], fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1 }}>
                                        Issue Request
                                    </Typography>
                                    <Chip size="small" label={`#${request.id ?? id ?? ''}`} sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#fff', color: neutral[700], border: `1px solid ${border.subtle}` }} />
                                </Stack>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1.15 }}>
                                    {request.name || 'Loading…'}
                                </Typography>
                                {request.description && (
                                    <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5, maxWidth: 620 }}>
                                        {request.description}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
                            <StatTile value={requestCommodities.length} label="Line items" />
                            <StatTile value={totalQty} label="Units" />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2.25, borderColor: alpha(brand[500], 0.12) }} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.75, sm: 4 }} flexWrap="wrap" useFlexGap>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 38, height: 38, bgcolor: brand[500], fontSize: '0.82rem', fontWeight: 700 }}>{initials}</Avatar>
                            <Box>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Requested by
                                </Typography>
                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: neutral[800] }}>{requesterName}</Typography>
                            </Box>
                        </Stack>
                        <MetaItem icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />} label="Branch" value={branchName} />
                    </Stack>
                </Box>
            </Box>

            {/* Guidance banner */}
            <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{ mb: 2.5, p: 1.75, borderRadius: 2, bgcolor: alpha(gold[500], 0.06), border: `1px solid ${alpha(gold[500], 0.25)}` }}
            >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: gold[700], mt: 0.1, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: neutral[700], lineHeight: 1.55 }}>
                    Match each requested item to the specific assets being handed out — pick them by{' '}
                    <Box component="strong" sx={{ color: neutral[900] }}>engraved number</Box> below — then confirm issuance.
                    This records the assets against the requester and updates the store.
                </Typography>
            </Stack>

            {/* Requested commodities */}
            <Box sx={cardSx}>
                <PageSection variant="flat" title="Requested Commodities" icon={<ReceiptLongOutlinedIcon />}>
                    {loading ? (
                        <Stack alignItems="center" sx={{ py: 4 }}>
                            <CircularProgress size={26} sx={{ color: brand[500] }} />
                            <Typography variant="caption" sx={{ mt: 1.25, color: neutral[500] }}>Loading commodities…</Typography>
                        </Stack>
                    ) : requestCommodities.length > 0 ? (
                        <Box sx={{ border: `1px solid ${border.subtle}`, borderRadius: 2, overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: surface.muted }}>
                                        {['Commodity', 'Unit of Measure', 'Asset Type'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: neutral[500], borderBottom: `1px solid ${border.subtle}` }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: neutral[500], borderBottom: `1px solid ${border.subtle}` }}>
                                            Qty
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requestCommodities.map((item, idx) => (
                                        <TableRow
                                            key={idx}
                                            sx={{
                                                transition: 'background 0.12s',
                                                '&:hover': { bgcolor: alpha(brand[500], 0.03) },
                                                '& td': { borderBottom: idx === requestCommodities.length - 1 ? 'none' : `1px solid ${border.subtle}` },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600, color: neutral[800] }}>{item.commodity.name}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{item.commodity.groupName || '—'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={item.commodity.assetType?.name || '—'}
                                                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(brand[500], 0.08), color: brand[700], border: `1px solid ${alpha(brand[500], 0.2)}` }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box component="span" sx={{ display: 'inline-flex', minWidth: 26, justifyContent: 'center', px: 1, py: 0.35, borderRadius: 1, bgcolor: neutral[900], color: '#fff', fontSize: '0.76rem', fontWeight: 700 }}>
                                                    {item.quantity}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center', border: `1px dashed ${neutral[250]}`, borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: neutral[500] }}>No commodities found for this request.</Typography>
                        </Box>
                    )}
                </PageSection>
            </Box>

            {/* Issue items */}
            <Box sx={cardSx}>
                <PageSection
                    variant="flat"
                    title="Issue Items"
                    subtitle="Select the specific assets (by engraved number) to fulfil each requested line."
                    icon={<Inventory2OutlinedIcon />}
                >
                    <InventoryTable issue title="" />
                </PageSection>
            </Box>

            {/* Footer actions */}
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
                <MuiButton
                    onClick={() => navigate(-1)}
                    type="button"
                    variant="outlined"
                    startIcon={<ArrowBackIcon fontSize="small" />}
                    sx={{
                        height: 44, px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        borderColor: border.default, color: neutral[600],
                        '&:hover': { borderColor: neutral[400], bgcolor: neutral[50] },
                    }}
                >
                    Back
                </MuiButton>
                <MuiButton
                    onClick={handleRequestRejection}
                    type="button"
                    variant="contained"
                    disabled={sendingRequest}
                    startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleOutlineIcon fontSize="small" />}
                    sx={{
                        height: 44, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                        bgcolor: brand[500], boxShadow: `0 3px 10px ${alpha(brand[500], 0.3)}`,
                        '&:hover': { bgcolor: brand[700], boxShadow: `0 5px 16px ${alpha(brand[500], 0.4)}` },
                        '&.Mui-disabled': { bgcolor: alpha(brand[500], 0.5), color: '#fff' },
                    }}
                >
                    {sendingRequest ? 'Issuing…' : 'Issue Items'}
                </MuiButton>
            </Stack>
        </Box>
    );
}

export default IssueRequestDetails
