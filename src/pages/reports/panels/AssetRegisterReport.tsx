import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';

const ACCENT = '#059669';

interface AssetRow {
    id: number;
    assetName: string;
    category: string;
    subCategory: string;
    serialNumber: string;
    assetTag: string;
    branch: string;
    department: string;
    assignedTo: string;
    status: string;
    statusCode: string;
    purchaseCost: string;
    netBookValue: string;
    acquisitionDate: string;
    condition: string;
}

const COLUMNS: ReportColumn<AssetRow>[] = [
    { id: 'assetTag', label: 'Tag', minWidth: 90 },
    { id: 'assetName', label: 'Asset Name', minWidth: 170 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'subCategory', label: 'Sub-category', minWidth: 120 },
    { id: 'serialNumber', label: 'Serial No.', minWidth: 120 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'department', label: 'Department', minWidth: 110 },
    { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
    { id: 'status', label: 'Status', minWidth: 100, format: (v) => <StatusChip value={v} /> },
    { id: 'purchaseCost', label: 'Purchase Cost', minWidth: 130, align: 'right' },
    { id: 'netBookValue', label: 'Net Book Value', minWidth: 130, align: 'right' },
    { id: 'acquisitionDate', label: 'Acquired', minWidth: 100 },
    { id: 'condition', label: 'Condition', minWidth: 100 },
];

/** Money arrives from the server pre-formatted with separators; only the currency is missing. */
const money = (v?: string | null) => (v ? `UGX ${v}` : '—');

const fmtDate = (v?: string | null) => {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime())
        ? v // dateReceipt is free text, so anything unparseable is shown as recorded
        : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toRow = (a: any): AssetRow => ({
    id: a.id,
    assetName: a.assetName ?? '—',
    category: a.assetType?.name ?? '—',
    subCategory: a.commodity?.name ?? '—',
    serialNumber: a.serialNumber ?? '—',
    assetTag: a.engravedNumber ?? '—',
    branch: a.branch?.name ?? '—',
    department: a.assignedTo?.department?.name ?? '—',
    assignedTo: a.assignedTo
        ? `${a.assignedTo.firstName ?? ''} ${a.assignedTo.lastName ?? ''}`.trim() || '—'
        : 'Unassigned',
    status: a.assetStatus?.name ?? '—',
    statusCode: a.assetStatus?.status ?? '',
    purchaseCost: money(a.purchaseCost),
    netBookValue: money(a.detailNetBookValue),
    acquisitionDate: fmtDate(a.dateReceipt),
    // The server derives this from the category's useful life against the receipt date.
    condition: a.disposalStatus ?? '—',
});

const AssetRegisterReport = () => {
    const { rows, loading, error, applyFilters, refresh } = useReportData<AssetRow>(
        async (f: ReportShellFilters) => {
            /*
             * Filtered server-side wherever /assets supports it. Department is the exception: it
             * lives on the holder, not the asset, so there is no query parameter for it and it has
             * to be narrowed below.
             */
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: 500,
                endPoint: 'assets',
                params: {
                    assetTypeId: f.categoryId,
                    assetStatusId: f.statusId,
                    location: f.branch,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('assets');
            const mapped: AssetRow[] = (res.data?.content ?? []).map(toRow);
            return f.department ? mapped.filter((r) => r.department === f.department) : mapped;
        },
    );

    // Counted off the stable status codes, not the display names, so renaming a status in Settings
    // cannot silently zero a card.
    const countByCode = (...codes: string[]) => rows.filter((r) => codes.includes(r.statusCode)).length;
    const inUse = countByCode('assetAssigned', 'issued');
    const inStore = countByCode('sentToStore', 'issuanceAvailable');
    const inRepair = countByCode('inMaintenance');

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Assets', value: rows.length, icon: <TuneOutlinedIcon />, color: ACCENT, subLabel: 'Matching filters' },
            { label: 'In Use / Active', value: inUse, icon: <CheckCircleOutlinedIcon />, color: '#15803D', subLabel: 'Assigned & deployed' },
            { label: 'In Store', value: inStore, icon: <InventoryOutlinedIcon />, color: '#0369A1', subLabel: 'Unassigned stock' },
            { label: 'In Repair', value: inRepair, icon: <BuildOutlinedIcon />, color: '#D97706', subLabel: 'Under maintenance' },
        ]} />
    );

    return (
        <ReportShell
            title="Asset Register Report"
            subtitle="Full register of all assets with values, locations and assignments"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'department', 'category', 'status']}
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
                emptyMessage="No assets match these filters."
            />
        </ReportShell>
    );
};

export default AssetRegisterReport;
