import { useState } from 'react';
import RecentActorsOutlinedIcon from '@mui/icons-material/RecentActorsOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

const ACCENT = '#D97706';

interface RequestRow {
    id: number;
    requestorName: string;
    requestDate: string;
    department: string;
    branch: string;
    itemRequested: string;
    category: string;
    quantityRequested: number;
    status: string;
    approvalDate: string;
    approvingOfficer: string;
    remarks: string;
}

const MOCK_ROWS: RequestRow[] = [
    { id: 1, requestorName: 'John Okello', requestDate: '2026-01-08', department: 'IT', branch: 'Head Office', itemRequested: 'Laptop', category: 'IT Equipment', quantityRequested: 2, status: 'approved', approvalDate: '2026-01-10', approvingOfficer: 'Grace Amanya', remarks: '' },
    { id: 2, requestorName: 'Mary Akot', requestDate: '2026-01-15', department: 'Finance', branch: 'Kampala Branch', itemRequested: 'Printer Cartridge', category: 'Stationery', quantityRequested: 5, status: 'issued', approvalDate: '2026-01-16', approvingOfficer: 'Peter Omara', remarks: 'Urgent' },
    { id: 3, requestorName: 'Samuel Opio', requestDate: '2026-02-01', department: 'HR', branch: 'Gulu Branch', itemRequested: 'Office Chair', category: 'Furniture', quantityRequested: 3, status: 'pending', approvalDate: '', approvingOfficer: '', remarks: '' },
    { id: 4, requestorName: 'Alice Nansubuga', requestDate: '2026-02-10', department: 'Security', branch: 'Mbarara Branch', itemRequested: 'Radio', category: 'Office Equipment', quantityRequested: 2, status: 'rejected', approvalDate: '2026-02-12', approvingOfficer: 'Grace Amanya', remarks: 'Budget constraints' },
    { id: 5, requestorName: 'Robert Atim', requestDate: '2026-03-05', department: 'Operations', branch: 'Jinja Branch', itemRequested: 'Vehicle Tyre', category: 'Fleet', quantityRequested: 4, status: 'approved', approvalDate: '2026-03-07', approvingOfficer: 'Peter Omara', remarks: '' },
    { id: 6, requestorName: 'Jane Achola', requestDate: '2026-03-12', department: 'Admin', branch: 'Head Office', itemRequested: 'Laptop', category: 'IT Equipment', quantityRequested: 1, status: 'pending', approvalDate: '', approvingOfficer: '', remarks: '' },
];

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

const RequestsReport = () => {
    const [rows, setRows] = useState<RequestRow[]>(MOCK_ROWS);

    const total = rows.length;
    const pending = rows.filter(r => r.status === 'pending').length;
    const approved = rows.filter(r => r.status === 'approved' || r.status === 'issued').length;
    const rejected = rows.filter(r => r.status === 'rejected').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Requests', value: total, icon: <RecentActorsOutlinedIcon />, color: ACCENT, subLabel: 'All time' },
            { label: 'Pending Approval', value: pending, icon: <HourglassEmptyOutlinedIcon />, color: '#D97706', subLabel: 'Awaiting action' },
            { label: 'Approved / Issued', value: approved, icon: <CheckCircleOutlinedIcon />, color: '#15803D', trend: 8, subLabel: 'Fulfilled requests' },
            { label: 'Rejected', value: rejected, icon: <CancelOutlinedIcon />, color: '#DC2626', subLabel: 'Declined requests' },
        ]} />
    );

    const handleFilters = (f: ReportShellFilters) => {
        let filtered = [...MOCK_ROWS];
        if (f.branch) filtered = filtered.filter(r => r.branch === f.branch);
        if (f.department) filtered = filtered.filter(r => r.department === f.department);
        if (f.category) filtered = filtered.filter(r => r.category === f.category);
        if (f.status) filtered = filtered.filter(r => r.status === f.status);
        setRows(filtered);
    };

    return (
        <ReportShell
            title="Requests / Requisitions Report"
            subtitle="All asset requests with status, approval and fulfilment tracking"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'department', 'category', 'status']}
            onApplyFilters={handleFilters}
            onRefresh={() => setRows(MOCK_ROWS)}
            onExportPdf={() => alert('PDF export triggered')}
            onExportExcel={() => alert('Excel export triggered')}
            onExportCsv={() => alert('CSV export triggered')}
            summaryCards={summaryCards}
        >
            <ReportDataTable columns={COLUMNS} rows={rows} accentColor={ACCENT} rowKey="id" />
        </ReportShell>
    );
};

export default RequestsReport;
