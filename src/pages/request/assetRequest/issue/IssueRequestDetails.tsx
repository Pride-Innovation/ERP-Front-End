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
    Grid,
    Stack,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Button as MuiButton,
    IconButton,
    LinearProgress,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    alpha,
} from "@mui/material";
import { toast } from "react-toastify";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { StatTile } from "../../../../components/layout";
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

/**
 * A key fact in the light strip across the base of the hero — the same "at a glance" idiom the
 * asset and inventory detail pages use, so the three read as one family.
 */
const HeroFact = ({
    label, value, first, avatar, onCopy,
}: {
    label: string; value?: string | null; first?: boolean; avatar?: ReactNode; onCopy?: () => void;
}) => {
    const empty = value === null || value === undefined || value === '';
    return (
        <Box
            sx={{
                flex: '1 1 160px',
                minWidth: 150,
                px: { xs: 2, md: 2.75 },
                py: 1.5,
                borderLeft: { xs: 'none', sm: first ? 'none' : `1px solid ${border.subtle}` },
            }}
        >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: neutral[500] }}>
                {label}
            </Typography>
            <Stack direction="row" spacing={0.85} alignItems="center" sx={{ mt: 0.35, minWidth: 0 }}>
                {avatar}
                <Typography noWrap sx={{
                    fontSize: '0.9rem',
                    fontWeight: empty ? 400 : 700,
                    fontStyle: empty ? 'italic' : 'normal',
                    color: empty ? neutral[400] : neutral[800],
                }}>
                    {empty ? 'Not specified' : value}
                </Typography>
                {onCopy && !empty && (
                    <Tooltip title="Copy">
                        <IconButton size="small" onClick={onCopy} sx={{ p: 0.2, color: alpha(brand[500], 0.7) }}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );
};

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
    /** Drives the hero's fulfilment bar — same source of truth as the submit gate. */
    const readyPct = requestCommodities.length === 0
        ? 0
        : Math.round((readyCount / requestCommodities.length) * 100);

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
        <Box sx={{ bgcolor: surface.page, minHeight: '100vh', px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto', pb: 6 }}>

            {/* ── Hero (light card idiom shared with the asset & inventory detail pages) ── */}
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    mb: 2.5,
                    bgcolor: '#fff',
                    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
                }}
            >
                {/* Faint brand accents for depth on the white card */}
                <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 92% -10%, ${alpha(brand[500], 0.07)} 0%, transparent 42%)`, pointerEvents: 'none' }} />
                <LocalShippingOutlinedIcon sx={{ position: 'absolute', right: -18, top: -20, fontSize: 180, color: alpha(brand[500], 0.05), transform: 'rotate(-12deg)', pointerEvents: 'none' }} />

                <Box sx={{ position: 'relative', px: { xs: 2.5, md: 3.5 }, pt: 2.25 }}>
                    {/* Back + breadcrumb */}
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.25 }}>
                        <IconButton
                            size="small"
                            onClick={() => navigate(-1)}
                            sx={{ color: brand[600], border: `1px solid ${alpha(brand[500], 0.25)}`, bgcolor: alpha(brand[50], 0.6), '&:hover': { bgcolor: alpha(brand[100], 0.7), borderColor: brand[500] } }}
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <HomeOutlinedIcon sx={{ fontSize: 14, color: neutral[400] }} />
                            <Typography variant="caption" sx={{ color: neutral[500] }}>Requests</Typography>
                            <Typography variant="caption" sx={{ color: neutral[300] }}>/</Typography>
                            <Typography variant="caption" sx={{ color: brand[700], fontWeight: 700 }}>Issue</Typography>
                        </Stack>
                    </Stack>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 2.5 }}>
                        {/* Identity */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: '16px', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: alpha(brand[500], 0.1), color: brand[600], border: `1px solid ${alpha(brand[500], 0.16)}`,
                            }}>
                                <LocalShippingOutlinedIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                {loading && !request.id ? (
                                    <>
                                        <Skeleton width={260} height={34} />
                                        <Skeleton width={340} height={20} />
                                    </>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.6rem' }, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.4px', color: neutral[900] }}>
                                            {request.name || 'Issue Request'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                            <Chip
                                                size="small"
                                                icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14 }} />}
                                                label={`Request #${request.id ?? id ?? ''}`}
                                                sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.08), color: brand[700], border: `1px solid ${alpha(brand[500], 0.14)}`, '& .MuiChip-icon': { color: brand[600] } }}
                                            />
                                            {request.status?.name && (
                                                <Chip size="small" label={request.status.name}
                                                    sx={{ height: 24, fontWeight: 700, fontSize: '0.72rem', bgcolor: alpha(gold[500], 0.12), color: gold[700], border: `1px solid ${alpha(gold[500], 0.3)}` }} />
                                            )}
                                            <Chip
                                                size="small"
                                                icon={allReady
                                                    ? <TaskAltOutlinedIcon sx={{ fontSize: 14 }} />
                                                    : <PendingActionsOutlinedIcon sx={{ fontSize: 14 }} />}
                                                label={allReady ? 'Ready to issue' : `${readyCount}/${requestCommodities.length} ready`}
                                                sx={{
                                                    height: 24, fontWeight: 700, fontSize: '0.72rem',
                                                    bgcolor: allReady ? alpha(statusTokens.success.main, 0.12) : alpha(gold[500], 0.12),
                                                    color: allReady ? statusTokens.success.strong : gold[700],
                                                    border: `1px solid ${alpha(allReady ? statusTokens.success.main : gold[500], 0.3)}`,
                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                }}
                                            />
                                        </Stack>
                                        {request.description && (
                                            <Typography variant="body2" sx={{ color: neutral[500], mt: 1.25, maxWidth: 620 }}>
                                                {request.description}
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Stack>

                        {/* Fulfilment dial — the one number that decides whether this page can be submitted */}
                        <Box sx={{ minWidth: 210, flexShrink: 0 }}>
                            <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: neutral[500] }}>
                                    Fulfilment
                                </Typography>
                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: allReady ? statusTokens.success.strong : gold[700] }}>
                                    {readyPct}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={readyPct}
                                sx={{
                                    height: 8, borderRadius: 4, bgcolor: alpha(neutral[900], 0.06),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        bgcolor: allReady ? statusTokens.success.main : gold[500],
                                        transition: 'transform .35s ease',
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: '0.7rem', color: neutral[500], mt: 0.75 }}>
                                {allReady
                                    ? 'Every line is ready to issue'
                                    : `${requestCommodities.length - readyCount} line(s) still need attention`}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* At-a-glance strip across the base of the hero */}
                <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', bgcolor: alpha(brand[500], 0.03), borderTop: `1px solid ${border.subtle}` }}>
                    <HeroFact
                        first
                        label="Requested by"
                        value={requesterName}
                        avatar={<Avatar sx={{ width: 22, height: 22, bgcolor: brand[500], fontSize: '0.6rem', fontWeight: 700 }}>{initials}</Avatar>}
                    />
                    <HeroFact label="Branch" value={branchName === '—' ? null : branchName} />
                    <HeroFact label="Requested on" value={requestedOn === '—' ? null : requestedOn} />
                    <HeroFact
                        label="Reference"
                        value={`REQ-${String(request.id ?? id ?? '').padStart(5, '0')}`}
                        onCopy={() => {
                            navigator.clipboard.writeText(`REQ-${String(request.id ?? id ?? '').padStart(5, '0')}`);
                            toast.success('Reference copied');
                        }}
                    />
                </Box>
            </Box>

            {/* ── Stat strip (inventory-detail idiom) ── */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6} md={3}>
                    <StatTile label="Line Items" value={requestCommodities.length} helper="on this request" accent="info" icon={<ListAltOutlinedIcon />} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile label="Total Units" value={totalQty} helper="units requested" accent="gold" icon={<Inventory2Outlined />} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile label="Ready" value={readyCount} helper="lines good to go" accent="success" icon={<TaskAltOutlinedIcon />} />
                </Grid>
                <Grid item xs={6} md={3}>
                    <StatTile
                        label="Outstanding"
                        value={requestCommodities.length - readyCount}
                        helper={allReady ? 'nothing pending' : 'need attention'}
                        accent={allReady ? 'neutral' : 'warning'}
                        icon={<PendingActionsOutlinedIcon />}
                    />
                </Grid>
            </Grid>

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
                                <TableRow sx={{
                                    '& th': {
                                        bgcolor: alpha(brand[500], 0.04),
                                        fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase',
                                        letterSpacing: '0.05em', color: brand[700],
                                        borderBottom: `1px solid ${border.subtle}`, py: 1.4, whiteSpace: 'nowrap',
                                    },
                                }}>
                                    <TableCell>Commodity</TableCell>
                                    <TableCell>Asset Type</TableCell>
                                    <TableCell align="center">Qty</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestCommodities.map((item, idx) => {
                                    const st = LINE_STATUS_CFG[lineStatuses[idx]];
                                    const isReady = lineStatuses[idx] === 'ready';
                                    return (
                                        <TableRow
                                            key={idx}
                                            sx={{
                                                transition: 'background 0.12s',
                                                // A ready line gets a faint green rail, so scanning the list
                                                // shows what's outstanding without reading the status column.
                                                boxShadow: isReady
                                                    ? `inset 3px 0 0 ${statusTokens.success.main}`
                                                    : `inset 3px 0 0 ${alpha(st.color, 0.5)}`,
                                                '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.015) },
                                                '&:hover': { bgcolor: alpha(brand[500], 0.04) },
                                                '& td': {
                                                    py: 1.6,
                                                    borderBottom: idx === requestCommodities.length - 1 ? 'none' : `1px solid ${border.subtle}`,
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Box sx={{
                                                        width: 28, height: 28, borderRadius: '9px', flexShrink: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.74rem', fontWeight: 800,
                                                        color: brand[700], bgcolor: alpha(brand[500], 0.1),
                                                    }}>
                                                        {idx + 1}
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: neutral[900], lineHeight: 1.3 }}>
                                                            {item.commodity.name}
                                                        </Typography>
                                                        {item.commodity.groupName && (
                                                            <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>
                                                                {item.commodity.groupName}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={item.commodity.assetType?.name || '—'}
                                                    sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: alpha(brand[500], 0.08), color: brand[700], border: `1px solid ${alpha(brand[500], 0.2)}` }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box component="span" sx={{ display: 'inline-flex', minWidth: 32, justifyContent: 'center', px: 1, py: 0.4, borderRadius: '8px', bgcolor: alpha(neutral[900], 0.06), color: neutral[800], fontSize: '0.8rem', fontWeight: 700 }}>
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
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(allReady ? statusTokens.success.main : gold[500], 0.12),
                        color: allReady ? statusTokens.success.strong : gold[700],
                        transition: 'all .2s ease',
                    }}>
                        {allReady
                            ? <TaskAltOutlinedIcon sx={{ fontSize: 19 }} />
                            : <PendingActionsOutlinedIcon sx={{ fontSize: 19 }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: neutral[800], lineHeight: 1.25 }}>
                            {allReady
                                ? 'All lines ready — you can issue now.'
                                : `${readyCount} of ${requestCommodities.length} line(s) ready`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: neutral[500] }}>
                            {allReady
                                ? `${totalQty} unit(s) will be recorded against ${requesterName}`
                                : 'Pick engraved numbers or fix quantities to continue'}
                        </Typography>
                    </Box>
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
        </Box>
    );
}

export default IssueRequestDetails
