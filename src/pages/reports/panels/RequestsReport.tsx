import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData, { REPORT_PAGE_SIZE, truncationNotice } from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';
import { requestApproverLabel } from '../../request/approverLabel';
import {
    REQUEST_DONE_CODE, REQUEST_REJECTED_CODE, REQUEST_STATUS_CODES,
} from '../reportStatus';

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
    lastUpdated: string;
    currentlyWith: string;
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
    { id: 'status', label: 'Status', minWidth: 110, format: (v, r) => <StatusChip value={v} code={r.statusCode} /> },
    { id: 'lastUpdated', label: 'Last Updated', minWidth: 110, format: (v) => v || '—' },
    { id: 'currentlyWith', label: 'Currently With', minWidth: 150, format: (v) => v || '—' },
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
        /*
         * This was "Approval Date", shown whenever the code contained "approved" — which includes
         * every intermediate tier (managerApproved, hodApproved, …), so a request half-way up its
         * ladder carried an approval date. The value was always `lastModified`; the heading now says so.
         */
        lastUpdated: fmtDate(r.lastModified),
        /*
         * Who it is waiting on — a person, or the unit a group step was routed to. This was headed
         * "Approving Officer" over `currentApprover`, which is the *next* approver, blank for a
         * unit-routed step and for every finished request.
         */
        currentlyWith: requestApproverLabel(r) ?? '',
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
    const { rows, notice, loading, error, applyFilters, refresh } = useReportData<RequestRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: REPORT_PAGE_SIZE,
                endPoint: 'requests',
                params: {
                    /*
                     * `statusIds`, not `status`.
                     *
                     * `GET /requests` **declares** a `status` parameter, so Spring accepted it
                     * without a murmur — but `RequestSearchCriteria` has no such field and
                     * `RequestSearchDao` only ever filters on `statusIds`. It was bound and never
                     * read, and this panel did not narrow by status in the browser either, so
                     * picking a status here changed **nothing at all**.
                     *
                     * Sharper than an undeclared parameter (which Spring drops silently) because the
                     * signature looks right: the endpoint advertises a filter it does not implement.
                     * The dead parameter has been removed from the controller so the next reader is
                     * not offered it again.
                     */
                    statusIds: f.statusId,
                    // The requester's department, in the database rather than after the cap.
                    requesterDepartmentId: f.departmentId,
                    startDate: f.dateFrom,
                    endDate: f.dateTo,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('requests');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            // Branch and category have no query parameters on /requests — they belong to the
            // requester's duty station and to each line's commodity rather than to the request.
            const narrowed = flat.filter((r) => {
                if (f.branch && r.branch !== f.branch) return false;
                if (f.category && r.category !== f.category) return false;
                return true;
            });

            return { rows: narrowed, notice: truncationNotice(res, 'requests') };
        },
    );

    const requests = new Set(rows.map((r) => r.id.split('-').slice(0, 2).join('-'))).size;
    /*
     * Counted by request, not by line, and on the two terminal codes. "Approved" used to mean "code
     * contains 'approved'", which counted every request that had cleared one tier of several as
     * having "cleared its workflow".
     */
    const byRequest = new Map(rows.map((r) => [r.id.split('-').slice(0, 2).join('-'), r.statusCode]));
    const codes = Array.from(byRequest.values());
    const completed = codes.filter((c) => c === REQUEST_DONE_CODE).length;
    const rejected = codes.filter((c) => c === REQUEST_REJECTED_CODE).length;
    const inProgress = codes.length - completed - rejected;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Requested Lines', value: rows.length, icon: <AssignmentOutlinedIcon />, color: ACCENT, subLabel: `${requests} request(s)` },
            { label: 'In Progress', value: inProgress, icon: <PendingActionsOutlinedIcon />, color: '#D97706', subLabel: 'Still moving through the workflow' },
            { label: 'Completed', value: completed, icon: <CheckCircleOutlinedIcon />, color: '#15803D', subLabel: 'Receipt acknowledged' },
            { label: 'Rejected', value: rejected, icon: <CancelOutlinedIcon />, color: '#DC2626', subLabel: 'Declined in the workflow' },
        ]} />
    );

    return (
        <ReportShell
            title="Requests Report"
            subtitle="What was asked for, by whom, and where each request got to"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'department', 'category', 'status']}
            statusCodes={REQUEST_STATUS_CODES}
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
                emptyMessage="No requests match these filters."
            />
        </ReportShell>
    );
};

export default RequestsReport;
