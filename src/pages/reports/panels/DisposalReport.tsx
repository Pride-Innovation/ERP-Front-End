import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn } from '../ReportDataTable';
import useReportData from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';

const ACCENT = '#DC2626';

interface DisposalRow {
    id: number;
    assetTag: string;
    assetName: string;
    category: string;
    branch: string;
    department: string;
    disposalDate: string;
    disposalMethod: string;
    reasonForDisposal: string;
    approvedBy: string;
    netBookValueAtDisposal: string;
    nbvValue: number;
}

const COLUMNS: ReportColumn<DisposalRow>[] = [
    { id: 'assetTag', label: 'Tag', minWidth: 90 },
    { id: 'assetName', label: 'Asset Name', minWidth: 180 },
    { id: 'category', label: 'Category', minWidth: 130 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'department', label: 'Department', minWidth: 110 },
    { id: 'disposalDate', label: 'Disposal Date', minWidth: 110 },
    { id: 'disposalMethod', label: 'Disposal Method', minWidth: 140 },
    { id: 'reasonForDisposal', label: 'Reason', minWidth: 220 },
    { id: 'approvedBy', label: 'Approved By', minWidth: 130 },
    { id: 'netBookValueAtDisposal', label: 'NBV at Disposal', minWidth: 130, align: 'right' },
];

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const toNumber = (v?: string | null) => Number(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;

const toRow = (a: any): DisposalRow => ({
    id: a.id,
    assetTag: a.engravedNumber ?? '—',
    assetName: a.assetName ?? '—',
    category: a.assetType?.name ?? '—',
    branch: a.branch?.name ?? '—',
    department: a.assignedTo?.department?.name ?? '—',
    disposalDate: fmtDate(a.disposalDate),
    /*
     * Every disposal now travels as a DISPOSAL_TRANSFER movement to the Head Office Disposal store,
     * so the method is the same for all of them. It is stated rather than dropped because the column
     * exists on the printed report the business already uses.
     */
    disposalMethod: 'Transfer to Disposal Store',
    // The gate writes its justification onto the movement's remarks; the asset carries its own
    // description, which is the nearest thing held against the asset itself.
    reasonForDisposal: a.description ?? '—',
    approvedBy: '—',
    netBookValueAtDisposal: a.detailNetBookValue ? `UGX ${a.detailNetBookValue}` : '—',
    nbvValue: toNumber(a.detailNetBookValue),
});

const DisposalReport = () => {
    const { rows, loading, error, applyFilters, refresh } = useReportData<DisposalRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: 500,
                endPoint: 'assets',
                params: {
                    // The one filter that defines this report: written-off assets only.
                    disposed: true,
                    assetTypeId: f.categoryId,
                    location: f.branch,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('disposals');
            const mapped: DisposalRow[] = (res.data?.content ?? []).map(toRow);
            return f.department ? mapped.filter((r) => r.department === f.department) : mapped;
        },
    );

    const totalNbv = rows.reduce((sum, r) => sum + r.nbvValue, 0);
    const thisYear = rows.filter((r) => r.disposalDate.endsWith(String(new Date().getFullYear()))).length;
    const writtenOffWithValue = rows.filter((r) => r.nbvValue > 0).length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Disposed Assets', value: rows.length, icon: <DeleteSweepOutlinedIcon />, color: ACCENT, subLabel: 'Matching filters' },
            { label: 'Disposed This Year', value: thisYear, icon: <EventBusyOutlinedIcon />, color: '#B45309', subLabel: 'Current calendar year' },
            {
                label: 'NBV Written Off',
                value: `UGX ${totalNbv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                icon: <PaidOutlinedIcon />, color: '#7C3AED', subLabel: 'Book value at disposal',
            },
            { label: 'Disposed With Value', value: writtenOffWithValue, icon: <PendingActionsOutlinedIcon />, color: '#0369A1', subLabel: 'Not fully depreciated' },
        ]} />
    );

    return (
        <ReportShell
            title="Disposal Report"
            subtitle="Assets written off, when they went and what they were still worth"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'department', 'category']}
            onApplyFilters={applyFilters}
            onRefresh={refresh}
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
                emptyMessage="No disposed assets match these filters."
            />
        </ReportShell>
    );
};

export default DisposalReport;
