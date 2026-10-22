import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData, { REPORT_PAGE_SIZE, truncationNotice } from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';
import useAccessScope from '../../../core/permissions/useAccessScope';

const ACCENT = '#D97706';

interface MaintenanceRow {
    id: number;
    assetTag: string;
    assetName: string;
    category: string;
    branch: string;
    startDate: string;
    completionDate: string;
    technician: string;
    status: string;
    statusCode: string;
    description: string;
}

/*
 * Vendor, cost, maintenance type and department are deliberately absent.
 *
 * The Repair record holds a start date, an end date, a technician, a reason, a status and completion
 * notes — it has never captured a vendor or a cost. Those columns were in the mock, and keeping them
 * against live data would produce a report that looks complete and is permanently empty. Better to
 * show what the business records than to imply it records more.
 */
const COLUMNS: ReportColumn<MaintenanceRow>[] = [
    { id: 'assetTag', label: 'Tag', minWidth: 90 },
    { id: 'assetName', label: 'Asset Name', minWidth: 170 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'startDate', label: 'Start Date', minWidth: 100 },
    { id: 'completionDate', label: 'Completion', minWidth: 100, format: (v) => v || '—' },
    { id: 'technician', label: 'Technician', minWidth: 130 },
    { id: 'status', label: 'Status', minWidth: 110, format: (v, r) => <StatusChip value={v} code={r.statusCode} /> },
    { id: 'description', label: 'Reason / Notes', minWidth: 260 },
];

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

export const toRow = (r: any): MaintenanceRow => ({
    id: r.id,
    assetTag: r.asset?.engravedNumber ?? '—',
    assetName: r.asset?.assetName ?? '—',
    category: r.asset?.assetType?.name ?? '—',
    /*
     * The branch the repair belongs to - the one that sent the asset - not where the asset is now.
     * On the bench an asset reads Head Office, so this column used to say "Head Office" on every open
     * repair. Falls back to the asset's branch for a backend that does not send it yet.
     */
    branch: r.sentFromBranchName ?? r.asset?.branch?.name ?? '—',
    startDate: fmtDate(r.repairStartDate),
    completionDate: fmtDate(r.repairEndDate),
    // "Internal" / "External" when the record says which; typed text from before the picker has no kind.
    technician: r.technician
        ? (r.technicianType === 'INTERNAL' ? `${r.technician} (Internal)`
            : r.technicianType === 'EXTERNAL' ? `${r.technician} (External)` : r.technician)
        : '—',
    status: r.status ?? '—',
    // Repair.status is itself the stable value ("Pending" / "Completed").
    statusCode: r.status ?? '',
    // The reason it went in, plus whatever was written when it came back.
    description: [r.repairReason, r.completionNotes].filter(Boolean).join(' — ') || '—',
});

/** Repair.status is free text with two values written by RepairService, not the status catalogue. */
const REPAIR_STATUSES = [
    { id: 'Pending', label: 'Pending', code: 'Pending' },
    { id: 'Completed', label: 'Completed', code: 'Completed' },
];

const MaintenanceReport = () => {
    /*
     * Head Office sees every branch's repairs, a branch sees its own - the server decides that. The
     * Branch and Repaired By filters are offered only to someone who sees every branch: for anyone
     * else the server already narrows to their branch, so a branch picker could only ever offer
     * itself, or be refused.
     */
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('ASSETS', 'VIEW') === 'ALL';

    const { rows, notice, loading, error, applyFilters, refresh } = useReportData<MaintenanceRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: REPORT_PAGE_SIZE,
                endPoint: 'assets/repairs',
                params: {
                    assetTypeId: f.categoryId,
                    status: f.statusCode,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                    // Matched on the server against the branch that sent the asset. It used to be
                    // compared in the browser against the asset's current branch, so "Gulu" found
                    // nothing while Gulu's assets sat on the Head Office bench.
                    ...(seesEveryBranch && f.branchId ? { branchId: f.branchId } : {}),
                    ...(seesEveryBranch && f.repairedBy ? { repairedBy: f.repairedBy } : {}),
                },
            })) as any;

            if (res?.status !== 200) throw new Error('repairs');
            return {
                rows: (res.data?.content ?? []).map(toRow),
                notice: truncationNotice(res, 'repairs'),
            };
        },
    );

    const done = rows.filter((r) => !!r.completionDate).length;
    const open = rows.length - done;
    const technicians = new Set(rows.map((r) => r.technician).filter((t) => t && t !== '—')).size;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Repair Jobs', value: rows.length, icon: <BuildOutlinedIcon />, color: ACCENT, subLabel: 'Matching filters' },
            { label: 'Completed', value: done, icon: <TaskAltOutlinedIcon />, color: '#15803D', subLabel: 'Returned to service' },
            { label: 'Still Open', value: open, icon: <PendingActionsOutlinedIcon />, color: '#DC2626', subLabel: 'No completion date' },
            { label: 'Technicians', value: technicians, icon: <EngineeringOutlinedIcon />, color: '#0369A1', subLabel: 'Named on jobs' },
        ]} />
    );

    return (
        <ReportShell
            title="Maintenance Report"
            subtitle="Repair jobs raised against assets, and where each one stands"
            accentColor={ACCENT}
            // No department filter: a repair records none. Status it does record, and
            // /assets/repairs filters on it. Branch and Repaired By for all-branches viewers only.
            filterFields={seesEveryBranch
                ? ['dateRange', 'branch', 'category', 'status', 'repairedBy']
                : ['dateRange', 'category', 'status']}
            statusOptions={REPAIR_STATUSES}
            onApplyFilters={applyFilters}
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
                emptyMessage="No repair jobs match these filters."
            />
        </ReportShell>
    );
};

export default MaintenanceReport;
