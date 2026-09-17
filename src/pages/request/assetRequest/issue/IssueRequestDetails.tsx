/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    ReactNode,
    useCallback,
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
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { StatTile, StatusTone } from "../../../../components/layout";
import { RowData } from "../../../../components/forms/interface";
import { IRequest, IRequestAxiosResponse } from "../../interface";
import { RequestContext } from "../../../../context/request/RequestContext";
import { ICommodity } from "../../../settings/commodity/interface";
import {
    findAssetRequestByIDService,
    issueCommodities
} from "../service";
import { refusal } from "../../../../core/apis/globalService";
import {
    validateAssetsOfItems,
    validateCommodityQuantities,
    validateInventoryItems
} from "../../../../utils/helpers";
import InventoryTable, { IInventoryLineStatus } from "../../../../components/forms/InventoryTable";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { IIssueAxiosResponse } from "./interface";
import { brand, gold, neutral, border, status as statusTokens } from "../../../../utils/tokens";
import { IAssetType } from "../../../settings/assetTypes/interface";
import AssetTypeUtills from "../../../settings/assetTypes/utills";
import CommodityUtills from "../../../settings/commodity/utills";
import { ROUTES } from "../../../../core/routes/routes";
import { fieldSx } from "../../../../components/forms/Inputs";
import { requestedFromLabel } from '../../requestedFromLabel';

type RequestLine = { commodity: ICommodity; quantity: number };

/** Live per-line fulfilment state, derived from the same rules the submit validators enforce. */
type LineStatus = 'ready' | 'qty' | 'assets' | 'missing';

const LINE_STATUS_CFG: Record<LineStatus, { label: string; tone: StatusTone }> = {
    ready: { label: 'Ready', tone: 'success' },
    qty: { label: 'Qty mismatch', tone: 'danger' },
    assets: { label: 'Pick assets', tone: 'pending' },
    missing: { label: 'Not requested', tone: 'neutral' },
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
    const { rows, setRows, setAssetType, setIssuableAssets } = useContext(RequestContext);

    /**
     * Empty the issuable-asset pool.
     *
     * <p>`issuableAssets` hangs off the app-root RequestContext, so it outlives this page and every
     * navigation in the session. Without this reset an asset issued on one request stayed in the
     * pool and was still offered on the next request's picker — the server refused it, correctly,
     * but only after the issuer had picked it.
     *
     * <p>Clearing is now enough on its own, where it used not to be: each picker re-reads its
     * commodity when its dropdown opens, so an emptied pool refills from the server at the moment
     * somebody looks. That is what makes the reset after a refusal below do what its comment always
     * claimed — it cleared the stale entry and then nothing re-read it, leaving the list empty until
     * a row happened to change.
     */
    const resetAssetPool = useCallback(
        () => setIssuableAssets({}),
        [setIssuableAssets],
    );

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

        // Before the rows — and therefore the engraved-number pickers — exist. Resetting here
        // rather than in a mount effect keeps the ordering explicit: child effects run before
        // parent ones, so a mount effect would race the very fetches it is meant to precede.
        resetAssetPool();

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
            await fetchAllCommodities({ assetTypeId: tid as unknown as number });
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

    /**
     * The same judgement, keyed the other way round — by the row being edited rather than the line
     * being fulfilled — so the issue table can show each line's readiness on the row itself.
     *
     * <p>This is what let the separate "Requested Commodities" table go. It listed the same lines
     * with the same statuses, leaving the issuer to match line 1 there against line 1 here by eye.
     */
    const rowStatus = (row: RowData): IInventoryLineStatus | null => {
        const line = requestCommodities.find((l) => l.commodity.id === row.commodityId);
        // A row the issuer added that was never requested — flagged, not silently accepted.
        if (!line) return { ...LINE_STATUS_CFG.missing };
        const cfg = LINE_STATUS_CFG[lineStatus(line)];
        return { ...cfg, requestedQuantity: line.quantity };
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

                // Anything that is not a 201 is a refusal. `issueCommodities` answers
                // `catch (error) { return error }`, so a 400 never throws — it arrives here as a
                // value with no status, and the old code fell straight through the `catch` and
                // off the end of the function without a single toast. The issuer clicked "Issue",
                // nothing moved, and the server's reason (e.g. "Dell Monitor [id=42] — already
                // issued and awaiting delivery") was discarded. Surface it instead.
                toast.error(refusal(response, "Failed to issue this request. Please try again."));

                // The refusal is usually "this asset is no longer available" — someone else issued
                // it, or this picker was showing a stale entry. Re-read the pool so the list the
                // issuer retries from is the current one.
                resetAssetPool();
            } catch (error) {
                console.error(error);
                toast.error(refusal(error, "Failed to issue this request. Please try again."));
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
    /*
     * Where the request came from, named as the register names it.
     *
     * An issuer is deciding what to hand over and to whom; "Head Office" narrows that to eighteen
     * people across four departments, while "Finance" is an answer. Shares the register's rule rather
     * than repeating it, so the two screens cannot drift into describing one request differently.
     */
    const requestedFrom = requestedFromLabel(request.requester);
    const requestedOn = request.createDate
        ? new Date(request.createDate as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    return (
        // Same padding as every other detail page. This was a 1180px centred column, which made it
        // visibly narrower than the movement and inventory pages it sits beside.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <Box sx={{ pb: 6 }}>

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
                    <HeroFact label="Requested From" value={requestedFrom} />
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

            {/*
              * Two tiles, not four. Ready and the ready percentage are already stated by the hero's
              * fulfilment dial, its chip, and the sticky bar — the strip was repeating the same fact
              * a third and fourth time before the reader reached anything actionable.
              */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6} md={6}>
                    <StatTile label="Line Items" value={requestCommodities.length} helper={`${totalQty} unit(s) requested`} accent="info" icon={<ListAltOutlinedIcon />} />
                </Grid>
                <Grid item xs={6} md={6}>
                    <StatTile
                        label="Outstanding"
                        value={requestCommodities.length - readyCount}
                        helper={allReady ? 'nothing pending' : 'line(s) need attention'}
                        accent={allReady ? 'neutral' : 'warning'}
                        icon={<PendingActionsOutlinedIcon />}
                    />
                </Grid>
            </Grid>

            {/*
              * Issue items — pre-filled from the request, with each line's readiness on the row.
              *
              * There used to be a "Requested Commodities" table above this one listing the same
              * lines with the same statuses. Reading it meant matching a line there against the
              * same line here to act on it; folding the status in removes the cross-reference.
              */}
            <SectionCard
                icon={<Inventory2OutlinedIcon />}
                title="Issue Items"
                subtitle="Pre-filled from the request — pick the specific assets by engraved number, then confirm. This records the assets against the requester and updates the store."
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
                        <Typography variant="caption" sx={{ mt: 1.25, color: neutral[500] }}>Loading request lines…</Typography>
                    </Stack>
                ) : (
                    <InventoryTable issue title="Lines to issue" lineStatus={rowStatus} />
                )}
            </SectionCard>

            {/* Issuer comment — its own block rather than trailing loose under the table. */}
            <SectionCard
                icon={<ChatBubbleOutlineOutlinedIcon />}
                title="Issuer Comment"
                subtitle="Optional — shown to the approver during issuance approval."
            >
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any notes for the approver — part-issued lines, substitutions, condition of the items…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ ...fieldSx, '& .MuiInputBase-input': { padding: 0, fontSize: '0.875rem', lineHeight: 1.5 } }}
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
                        // 8px, matching the primary action on the inventory wizard. `borderRadius: 2`
                        // resolves through the theme to ~20px, which read as a pill.
                        height: 44, px: 3.5, borderRadius: '8px', textTransform: 'none', fontWeight: 700,
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
