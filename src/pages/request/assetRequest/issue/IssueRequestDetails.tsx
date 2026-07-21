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
    useRef,
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
    Paper,
    Skeleton,
    TextField,
    alpha,
} from "@mui/material";
import { toast } from "react-toastify";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
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
import { brand, gold, neutral, border, surface, status as statusTokens } from "../../../../utils/tokens";
import { IAssetType } from "../../../settings/assetTypes/interface";
import AssetTypeUtills from "../../../settings/assetTypes/utills";
import CommodityUtills from "../../../settings/commodity/utills";
import { ROUTES } from "../../../../core/routes/routes";
import { fieldSx } from "../../../../components/forms/Inputs";

type RequestLine = { commodity: ICommodity; quantity: number };

/** Live per-line fulfilment state, derived from the same rules the submit validators enforce. */
type LineStatus = 'ready' | 'qty' | 'assets' | 'missing';

const LINE_STATUS_CFG: Record<LineStatus, { label: string; color: string }> = {
    ready: { label: 'Ready', color: statusTokens.success.strong },
    qty: { label: 'Qty mismatch', color: statusTokens.danger.main },
    assets: { label: 'Pick assets', color: gold[700] },
    missing: { label: 'Not in issue list', color: neutral[500] },
};

/** Section card with a tinted icon header band — the widget idiom used across the app. */
const SectionCard = ({
    icon, title, subtitle, headerAction, children,
}: {
    icon: ReactNode; title: string; subtitle?: string; headerAction?: ReactNode; children: ReactNode;
}) => (
    <Paper elevation={0} sx={{ border: `1px solid ${border.subtle}`, borderRadius: 2.5, overflow: 'hidden', mb: 2.5 }}>
        <Box
            sx={{
                px: { xs: 2, md: 2.5 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5,
                borderBottom: `1px solid ${border.subtle}`,
                background: `linear-gradient(90deg, ${alpha(brand[500], 0.05)} 0%, transparent 65%)`,
            }}
        >
            <Box sx={{
                width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.1), color: brand[600],
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                '& .MuiSvgIcon-root': { fontSize: 18 },
            }}>
                {icon}
            </Box>
            <Box flex={1} minWidth={0}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{title}</Typography>
                {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            </Box>
            {headerAction}
        </Box>
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Box>
    </Paper>
);

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
    const [loading, setLoading] = useState(true);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { rows, setRows, setAssetType } = useContext(RequestContext);
    const [request, setRequest] = useState<IRequest>({} as IRequest)
    const [comment, setComment] = useState('');
    const { id } = useParams<{ id: string }>();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const { fetchAllCommodities } = CommodityUtills();
    const navigate = useNavigate();
    const seededRef = useRef(false);

    const [requestCommodities, setRequestCommodities] = useState<RequestLine[]>([]);

    // The type pickers and per-line readiness both need the asset-type directory.
    useEffect(() => {
        if (!assetTypes.length) fetchAllAssetTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Pre-seeds the Issue Items rows from the request's own lines so the issuer only has to
     * pick engraved numbers (or adjust quantities), instead of manually rebuilding every line.
     * Also unlocks the engraved-number pickers (context gate) and loads each line's item options.
     */
    const seedRowsFromRequest = async (lines: RequestLine[]) => {
        if (seededRef.current) return;
        seededRef.current = true;

        const seeded: RowData[] = lines.map((l, i) => ({
            id: Date.now() + i,
            name: l.commodity.name,
            groupName: l.commodity.groupName ?? '',
            quantity: l.quantity,
            commodityId: l.commodity.id as number,
            assetTypeId: (l.commodity.assetType?.id ?? '') as unknown as string,
            selectedAssets: [],
        }));
        setRows(seeded);

        const firstType = lines[0]?.commodity.assetType;
        if (firstType?.name) setAssetType(firstType as IAssetType);

        // Load the commodity options for every seeded category so the item dropdowns render.
        const typeIds = Array.from(new Set(seeded.map((r) => r.assetTypeId).filter(Boolean)));
        for (const tid of typeIds) {
            await fetchAllCommodities({ assetTypeId: tid as unknown as number, pageSize: 100 });
        }
    };

    const fetchRequest = async () => {
        setLoading(true);
        try {
            const response = await findAssetRequestByIDService(id as string) as IRequestAxiosResponse;
            if (response.status === 200) {
                setRequest(response.data);
                const lines = (response.data.commodities as RequestLine[]) ?? [];
                setRequestCommodities(lines);
                await seedRowsFromRequest(lines);
            } else {
                toast.error('Failed to load the request.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load the request.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { fetchRequest() }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Same rules the submit validators enforce, evaluated live per requested line. */
    const lineStatus = (line: RequestLine): LineStatus => {
        const row = rows.find((r) => r.commodityId === line.commodity.id);
        if (!row || !row.name) return 'missing';
        if (row.quantity !== line.quantity) return 'qty';
        const at = assetTypes.find((a) => String(a.id) === String(row.assetTypeId));
        if (at?.tracksAssets === true && (row.selectedAssets?.length ?? 0) !== row.quantity) return 'assets';
        return 'ready';
    };

    const lineStatuses = requestCommodities.map(lineStatus);
    const readyCount = lineStatuses.filter((s) => s === 'ready').length;
    const allReady = requestCommodities.length > 0 && readyCount === requestCommodities.length;

    const handleIssueItems = async () => {
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
                comment,
                assets,
                requestId: id
            }

            try {
                const response = await issueCommodities(data) as IIssueAxiosResponse;
                if (response.status === 201) {
                    toast.success("Request Issued Successfully");
                    // Leave the page so the filled form can't be re-submitted.
                    navigate(ROUTES.REQUEST);
                    return;
                }
            } catch (error) {
                console.error(error)
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
    const requestedOn = request.createDate
        ? new Date(request.createDate as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

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
                {/* <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg, ${brand[500]}, ${brand[700]})` }} /> */}
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
                                    {request.status?.name && (
                                        <Chip size="small" label={request.status.name} sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: alpha(gold[500], 0.12), color: gold[700], border: `1px solid ${alpha(gold[500], 0.3)}` }} />
                                    )}
                                </Stack>
                                {loading && !request.id ? (
                                    <>
                                        <Skeleton width={260} height={32} />
                                        <Skeleton width={340} height={18} />
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: neutral[900], lineHeight: 1.15 }}>
                                            {request.name || '—'}
                                        </Typography>
                                        {request.description && (
                                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.5, maxWidth: 620 }}>
                                                {request.description}
                                            </Typography>
                                        )}
                                    </>
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
                        <MetaItem icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />} label="Requested on" value={requestedOn} />
                    </Stack>
                </Box>
            </Box>

            {/* Requested commodities + live readiness */}
            <SectionCard
                icon={<ReceiptLongOutlinedIcon />}
                title="Requested Commodities"
                subtitle="What was approved for this request — with each line's live fulfilment status."
                headerAction={
                    <Chip
                        size="small"
                        label={`${readyCount}/${requestCommodities.length} ready`}
                        sx={{
                            height: 22, fontWeight: 700, fontSize: '0.7rem',
                            bgcolor: allReady ? alpha(statusTokens.success.main, 0.1) : alpha(gold[500], 0.12),
                            color: allReady ? statusTokens.success.strong : gold[700],
                        }}
                    />
                }
            >
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
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: neutral[500], borderBottom: `1px solid ${border.subtle}` }}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestCommodities.map((item, idx) => {
                                    const st = LINE_STATUS_CFG[lineStatuses[idx]];
                                    return (
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
                                            <TableCell align="right">
                                                <Chip
                                                    size="small"
                                                    label={st.label}
                                                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: alpha(st.color, 0.1), color: st.color, border: `1px solid ${alpha(st.color, 0.25)}` }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center', border: `1px dashed ${neutral[250]}`, borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: neutral[500] }}>No commodities found for this request.</Typography>
                    </Box>
                )}
            </SectionCard>

            {/* Issue items — pre-filled from the request; pick engraved numbers per asset line */}
            <SectionCard
                icon={<Inventory2OutlinedIcon />}
                title="Issue Items"
                subtitle="Lines are pre-filled from the request — pick the specific assets by engraved number, then confirm. This records the assets against the requester and updates the store."
            >
                <InventoryTable issue title="" />

                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Issuer comment (optional)"
                    placeholder="Any notes for the approver — shown as the issuer comment during issuance approval…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ ...fieldSx, mt: 2.5, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
                />
            </SectionCard>

            {/* Sticky action bar with live readiness */}
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky', bottom: 12, zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap',
                    px: { xs: 2, md: 2.5 }, py: 1.5,
                    borderRadius: 2.5, border: `1px solid ${border.subtle}`,
                    bgcolor: '#fff', boxShadow: `0 -4px 24px ${alpha('#000', 0.08)}`,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        bgcolor: allReady ? statusTokens.success.main : gold[500],
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[700] }}>
                        {allReady
                            ? 'All lines ready — you can issue now.'
                            : `${readyCount} of ${requestCommodities.length} line(s) ready`}
                    </Typography>
                </Stack>
                <MuiButton
                    onClick={handleIssueItems}
                    type="button"
                    variant="contained"
                    disabled={sendingRequest || !allReady}
                    startIcon={sendingRequest ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleOutlineIcon fontSize="small" />}
                    sx={{
                        height: 44, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                        bgcolor: brand[500], boxShadow: `0 3px 10px ${alpha(brand[500], 0.3)}`,
                        '&:hover': { bgcolor: brand[700], boxShadow: `0 5px 16px ${alpha(brand[500], 0.4)}` },
                        '&.Mui-disabled': { bgcolor: alpha(brand[500], 0.35), color: '#fff' },
                    }}
                >
                    {sendingRequest ? 'Issuing…' : 'Issue Items'}
                </MuiButton>
            </Paper>
        </Box>
    );
}

export default IssueRequestDetails
