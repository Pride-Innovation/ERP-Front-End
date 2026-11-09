import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData, { REPORT_PAGE_SIZE, truncationNotice } from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';
import { movementTypeLabel, statusConfig, statusLabel } from '../../movement/constants';
import useAccessScope from '../../../core/permissions/useAccessScope';
import { Box } from '@mui/material';
import { movementCurrentlyWith, movementCurrentlyWithHeadline, movementTransitDetail } from '../movementCurrentlyWith';

const ACCENT = '#0891B2';

interface MovementRow {
    id: string;
    movementDate: string;
    assetTag: string;
    assetName: string;
    category: string;
    serialNumber: string;
    fromBranch: string;
    fromDepartment: string;
    toBranch: string;
    toDepartment: string;
    requestedBy: string;
    /** One line - what the export prints. */
    currentlyWith: string;
    /** The same, split for the screen: the stage and party, then the plate / tracking line under it. */
    currentlyWithHeadline: string;
    currentlyWithDetail: string | null;
    status: string;
    statusCode: string;
    movementType: string;
}

const COLUMNS: ReportColumn<MovementRow>[] = [
    { id: 'movementDate', label: 'Date', minWidth: 100 },
    { id: 'assetTag', label: 'Tag', minWidth: 90 },
    { id: 'assetName', label: 'Asset Name', minWidth: 170 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'serialNumber', label: 'Serial No.', minWidth: 120 },
    { id: 'fromBranch', label: 'From Branch', minWidth: 130 },
    { id: 'fromDepartment', label: 'From Dept.', minWidth: 110 },
    { id: 'toBranch', label: 'To Branch', minWidth: 130 },
    { id: 'toDepartment', label: 'To Dept.', minWidth: 110 },
    { id: 'requestedBy', label: 'Requested By', minWidth: 130 },
    {
        id: 'currentlyWith', label: 'Currently With', minWidth: 170,
        // The export reads the one-line value; the screen puts the plate and tracking number under it.
        format: (_v, r) => (
            <Box>
                <Box component="span" sx={{ display: 'block' }}>{r.currentlyWithHeadline || '—'}</Box>
                {r.currentlyWithDetail && (
                    <Box component="span" sx={{ display: 'block', fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {r.currentlyWithDetail}
                    </Box>
                )}
            </Box>
        ),
    },
    { id: 'status', label: 'Status', minWidth: 100, format: (v, r) => <StatusChip value={v} code={r.statusCode} /> },
];

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const person = (u: any) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—' : '—');

/**
 * One row per item moved.
 *
 * <p>The columns name a tag, a serial and an asset — that is an item, and a movement carries
 * several. A consumable line has no tag, so it is shown by commodity name with dashes for the
 * asset-only fields rather than being dropped: it moved, and the report is of movements.
 */
export const toRows = (m: any): MovementRow[] => {
    const items: any[] = m.items ?? [];
    const base = {
        movementDate: fmtDate(m.dispatchDate ?? m.createDate),
        fromBranch: m.sourceStore?.location?.name ?? m.sourceUser?.branch?.name ?? '—',
        fromDepartment: m.sourceStore?.department?.name ?? '—',
        toBranch: m.destStore?.location?.name ?? m.recipientUser?.branch?.name ?? '—',
        toDepartment: m.destStore?.department?.name ?? m.recipientUser?.department?.name ?? '—',
        // The requester for a delivery against a request; otherwise whoever raised the movement. It
        // read `request.requester`, which the response never carried, so it was always the initiator.
        requestedBy: m.request?.requesterName || person(m.initiator),
        /*
         * Who or what has the items now, by stage. It showed `currentApprover` alone, which is
         * cleared as a movement is approved - measured, empty on all 110 - so it read "—" on every row.
         */
        currentlyWith: movementCurrentlyWith(m),
        currentlyWithHeadline: movementCurrentlyWithHeadline(m),
        currentlyWithDetail: movementTransitDetail(m),
        status: statusLabel(m.status),
        statusCode: m.status ?? '',
        movementType: movementTypeLabel(m.movementType),
    };

    if (items.length === 0) {
        return [{ ...base, id: `mov-${m.id}`, assetTag: '—', assetName: base.movementType, category: '—', serialNumber: '—' }];
    }

    return items.map((it, i) => ({
        ...base,
        id: `mov-${m.id}-${it.id ?? i}`,
        assetTag: it.asset?.engravedNumber ?? '—',
        assetName: it.asset?.assetName ?? it.commodity?.name ?? '—',
        // `assetTypeName` - the response carried no category at all before, so this read "—" always.
        category: it.asset?.assetTypeName ?? it.commodity?.assetTypeName ?? '—',
        serialNumber: it.asset?.serialNumber ?? it.serialNumber ?? '—',
    }));
};

/**
 * A movement's own statuses, for the shell's Status dropdown.
 *
 * <p>The dropdown was filled from the Status catalogue — request and asset states — which a movement
 * can never hold, so choosing one matched nothing and the table read as "there are none of those".
 * `id` is the enum constant because that is what `GET /movements` binds its `status` parameter to.
 */
const MOVEMENT_STATUSES = Object.entries(statusConfig)
    .map(([code, cfg]) => ({ id: code, label: cfg.label, code }));

const MovementReport = () => {
    /*
     * Head Office sees every branch's movements and filters by branch and department; a branch sees
     * the movements touching it (the server's four-ended scope) and gets neither filter - a branch
     * picker could only ever offer itself, or be refused.
     */
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('MOVEMENTS', 'VIEW') === 'ALL';

    const { rows, notice, loading, error, applyFilters, refresh } = useReportData<MovementRow>(
        async (f: ReportShellFilters) => {
            /*
             * Dates and status go to the server now.
             *
             * The comment here used to say "GET /movements declares only pageSize and pageNumber, so
             * there is nothing to filter with server-side". That stopped being true when the register
             * gained `MovementSearchDao`: the endpoint declares dates, status, type, category,
             * source, destination, courier and initiator. This report went on pulling a page and
             * narrowing it in the browser — and narrowing *after* a cap means a filter searches only
             * the first 500 records, so a match beyond them reads as "no results".
             *
             * The date filter was worse than redundant: it re-parsed the row's own **display
             * string** (`"14 Sep 2026"`, built by `fmtDate` a few lines above), so every movement
             * compared as midnight and a change of format or locale would have broken it silently.
             */
            const res = (await fetchRowsService({
                pageNumber: 0, pageSize: REPORT_PAGE_SIZE, endPoint: 'movements',
                params: {
                    // `dateFrom`/`dateTo` — what GET /movements declares. This sent `startDate`/
                    // `endDate`, which Spring dropped (trap #2), so every period returned every
                    // movement.
                    dateFrom: f.dateFrom,
                    dateTo: f.dateTo,
                    // The enum constant, which is what the endpoint binds.
                    status: f.statusCode,
                    /*
                     * Branch and category are the server's now. Branch was compared by name in the
                     * browser against a rule the server does not use; the server applies the same
                     * four ends it scopes on. Category could never match, because the response
                     * carried no category - it is matched on every line of the movement.
                     */
                    ...(seesEveryBranch && f.branchId ? { branchId: f.branchId } : {}),
                    ...(f.categoryId ? { assetTypeId: f.categoryId } : {}),
                },
            })) as any;

            if (res?.status !== 200) throw new Error('movements');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            const narrowed = flat.filter((r) => {
                // The server returned the movements with a line in this category; a movement can
                // carry lines of several, and the rows are per line, so the other lines are trimmed.
                if (f.category && r.category !== f.category) return false;
                // Department (Head Office only) stays here: a movement's department is its stores'
                // or its recipient's, which the endpoint has no parameter for.
                if (seesEveryBranch && f.department
                    && r.fromDepartment !== f.department && r.toDepartment !== f.department) return false;
                return true;
            });

            return { rows: narrowed, notice: truncationNotice(res, 'movements') };
        },
    );

    const movements = new Set(rows.map((r) => r.id.split('-').slice(0, 2).join('-'))).size;
    const inTransit = rows.filter((r) => r.statusCode === 'DISPATCHED' || r.statusCode === 'IN_TRANSIT').length;
    const completed = rows.filter((r) => r.statusCode === 'COMPLETED').length;
    const awaiting = rows.filter((r) => r.statusCode === 'DRAFT' || r.statusCode === 'INITIATED').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Items Moved', value: rows.length, icon: <SwapHorizOutlinedIcon />, color: ACCENT, subLabel: `${movements} movement(s)` },
            { label: 'On The Road', value: inTransit, icon: <LocalShippingOutlinedIcon />, color: '#D97706', subLabel: 'Dispatched or in transit' },
            { label: 'Completed', value: completed, icon: <TaskAltOutlinedIcon />, color: '#15803D', subLabel: 'Handed over' },
            { label: 'Awaiting Dispatch', value: awaiting, icon: <PendingActionsOutlinedIcon />, color: '#7C3AED', subLabel: 'Draft or initiated' },
        ]} />
    );

    return (
        <ReportShell
            title="Movement Report"
            subtitle="Every item that changed hands, where it went and how far it has got"
            accentColor={ACCENT}
            filterFields={seesEveryBranch
                ? ['dateRange', 'branch', 'department', 'category', 'status']
                : ['dateRange', 'category', 'status']}
            onApplyFilters={applyFilters}
            statusOptions={MOVEMENT_STATUSES}
            onRefresh={refresh}
            notice={notice}
            summaryCards={summaryCards}
            exportRows={rows}
            exportColumns={COLUMNS}
        >
            <ReportDataTable
                columns={COLUMNS}
                rows={rows}
                accentColor={ACCENT}
                rowKey="id"
                loading={loading}
                error={error}
                emptyMessage="No movements match these filters."
            />
        </ReportShell>
    );
};

export default MovementReport;
