import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData, { REPORT_PAGE_SIZE, truncationNotice } from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';

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
    { id: 'status', label: 'Status', minWidth: 110, format: (v) => <StatusChip value={v} /> },
    { id: 'description', label: 'Reason / Notes', minWidth: 260 },
];

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const toRow = (r: any): MaintenanceRow => ({
    id: r.id,
    assetTag: r.asset?.engravedNumber ?? '—',
    assetName: r.asset?.assetName ?? '—',
    category: r.asset?.assetType?.name ?? '—',
    branch: r.asset?.branch?.name ?? '—',
    startDate: fmtDate(r.repairStartDate),
    completionDate: fmtDate(r.repairEndDate),
    technician: r.technician ?? '—',
    status: r.status ?? '—',
    // The reason it went in, plus whatever was written when it came back.
    description: [r.repairReason, r.completionNotes].filter(Boolean).join(' — ') || '—',
});

const MaintenanceReport = () => {
    const { rows, notice, loading, error, applyFilters, refresh } = useReportData<MaintenanceRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: REPORT_PAGE_SIZE,
                endPoint: 'assets/repairs',
                params: {
                    assetTypeId: f.categoryId,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('repairs');
            const mapped: MaintenanceRow[] = (res.data?.content ?? []).map(toRow);

            // Branch lives on the asset, not the repair, so it is narrowed here.
            return {
                rows: f.branch ? mapped.filter((r) => r.branch === f.branch) : mapped,
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
            // No department or status filter: neither is recorded on a repair. Offering a control
            // that silently does nothing is worse than not offering it.
            filterFields={['dateRange', 'branch', 'category']}
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
