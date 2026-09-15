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
    approvedBy: string;
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
    { id: 'approvedBy', label: 'Approved By', minWidth: 130, format: (v) => v || '—' },
    { id: 'status', label: 'Status', minWidth: 100, format: (v) => <StatusChip value={v} /> },
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
const toRows = (m: any): MovementRow[] => {
    const items: any[] = m.items ?? [];
    const base = {
        movementDate: fmtDate(m.dispatchDate ?? m.createDate),
        fromBranch: m.sourceStore?.location?.name ?? m.sourceUser?.branch?.name ?? '—',
        fromDepartment: m.sourceStore?.department?.name ?? '—',
        toBranch: m.destStore?.location?.name ?? m.recipientUser?.branch?.name ?? '—',
        toDepartment: m.destStore?.department?.name ?? m.recipientUser?.department?.name ?? '—',
        requestedBy: person(m.request?.requester ?? m.initiator),
        approvedBy: person(m.currentApprover),
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
        category: it.asset?.assetType?.name ?? it.commodity?.assetType?.name ?? '—',
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
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                    // The enum constant, which is what the endpoint binds.
                    status: f.statusCode,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('movements');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            /*
             * Branch, department and category stay in the browser: a movement's ends are *stores*
             * and people, so `source`/`destination` take store names rather than a branch, and the
             * category belongs to each item rather than to the movement.
             */
            const narrowed = flat.filter((r) => {
                // A movement counts as touching a branch at either end, matching how the movements
                // listing itself scopes them.
                if (f.branch && r.fromBranch !== f.branch && r.toBranch !== f.branch) return false;
                if (f.department && r.fromDepartment !== f.department && r.toDepartment !== f.department) return false;
                if (f.category && r.category !== f.category) return false;
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
            filterFields={['dateRange', 'branch', 'department', 'category', 'status']}
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
