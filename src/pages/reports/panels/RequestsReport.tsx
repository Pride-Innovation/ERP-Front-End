import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';

const ACCENT = '#7C3AED';

interface RequestRow {
    id: string;
    requestDate: string;
    requestorName: string;
    department: string;
    branch: string;
    itemRequested: string;
    category: string;
    quantityRequested: number;
    status: string;
    statusCode: string;
    approvalDate: string;
    approvingOfficer: string;
    remarks: string;
}

const COLUMNS: ReportColumn<RequestRow>[] = [
    { id: 'requestDate', label: 'Date', minWidth: 100 },
    { id: 'requestorName', label: 'Requestor', minWidth: 140 },
    { id: 'department', label: 'Department', minWidth: 110 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'itemRequested', label: 'Item Requested', minWidth: 150 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'quantityRequested', label: 'Qty', minWidth: 60, align: 'center' },
    { id: 'status', label: 'Status', minWidth: 110, format: (v) => <StatusChip value={v} /> },
    { id: 'approvalDate', label: 'Approval Date', minWidth: 110, format: (v) => v || '—' },
    { id: 'approvingOfficer', label: 'Approving Officer', minWidth: 150, format: (v) => v || '—' },
    { id: 'remarks', label: 'Remarks', minWidth: 130, format: (v) => v || '—' },
];

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const person = (u: any) =>
    (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—' : '—');

/** One row per requested line — the columns describe an item, and a request holds several. */
const toRows = (r: any): RequestRow[] => {
    const lines: any[] = r.commodities ?? r.requestCommodities ?? [];
    const base = {
        requestDate: fmtDate(r.timeOfSubmissionOfRequest ?? r.createDate),
        requestorName: person(r.requester),
        department: r.requester?.department?.name ?? '—',
        branch: r.requester?.branch?.name ?? '—',
        status: r.status?.name ?? '—',
        statusCode: r.status?.status ?? '',
        // Only a fully-decided request has an approval date; the field is the last change to it.
        approvalDate: r.status?.status?.toLowerCase().includes('approved') ? fmtDate(r.lastModified) : '',
        approvingOfficer: person(r.currentApprover),
        remarks: r.description ?? '',
    };

    if (lines.length === 0) {
        return [{ ...base, id: `req-${r.id}`, itemRequested: r.name ?? '—', category: r.assetType?.name ?? '—', quantityRequested: 0 }];
    }

    return lines.map((l, i) => ({
        ...base,
        id: `req-${r.id}-${l.id ?? i}`,
        itemRequested: l.commodity?.name ?? l.name ?? '—',
        category: l.commodity?.assetType?.name ?? r.assetType?.name ?? '—',
        quantityRequested: Number(l.quantity) || 0,
    }));
};

const RequestsReport = () => {
    const { rows, loading, error, applyFilters, refresh } = useReportData<RequestRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: 300,
                endPoint: 'requests',
                params: {
                    // /requests filters by status *name*, not id.
                    status: f.status,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('requests');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            // Branch, department and category have no query parameters on /requests — they belong to
            // the requester and to each line's commodity rather than to the request itself.
            return flat.filter((r) => {
                if (f.branch && r.branch !== f.branch) return false;
                if (f.department && r.department !== f.department) return false;
                if (f.category && r.category !== f.category) return false;
                return true;
            });
        },
    );

    const requests = new Set(rows.map((r) => r.id.split('-').slice(0, 2).join('-'))).size;
    const approved = rows.filter((r) => r.statusCode?.toLowerCase().includes('approved')).length;
    const pending = rows.filter((r) => !r.statusCode?.toLowerCase().includes('approved')
        && !r.statusCode?.toLowerCase().includes('reject')).length;
    const totalQty = rows.reduce((sum, r) => sum + r.quantityRequested, 0);

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Requested Lines', value: rows.length, icon: <AssignmentOutlinedIcon />, color: ACCENT, subLabel: `${requests} request(s)` },
            { label: 'Approved', value: approved, icon: <CheckCircleOutlinedIcon />, color: '#15803D', subLabel: 'Cleared their workflow' },
            { label: 'In Progress', value: pending, icon: <PendingActionsOutlinedIcon />, color: '#D97706', subLabel: 'Awaiting a decision' },
            { label: 'Units Requested', value: totalQty, icon: <Inventory2OutlinedIcon />, color: '#0369A1', subLabel: 'Across all lines' },
        ]} />
    );

    return (
        <ReportShell
            title="Requests Report"
            subtitle="What was asked for, by whom, and where each request got to"
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
                emptyMessage="No requests match these filters."
            />
        </ReportShell>
    );
};

export default RequestsReport;
