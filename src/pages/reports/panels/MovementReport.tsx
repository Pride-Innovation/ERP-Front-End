import { useState } from 'react';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

const ACCENT = '#7C3AED';

interface MovementRow {
    id: number;
    assetName: string;
    category: string;
    serialNumber: string;
    assetTag: string;
    fromBranch: string;
    fromDepartment: string;
    toBranch: string;
    toDepartment: string;
    movementDate: string;
    requestedBy: string;
    approvedBy: string;
    status: string;
}

const MOCK_ROWS: MovementRow[] = [
    { id: 1, assetName: 'HP EliteBook 840', category: 'IT Equipment', serialNumber: 'SN-HPE-001', assetTag: 'TAG-0001', fromBranch: 'Head Office', fromDepartment: 'IT', toBranch: 'Gulu Branch', toDepartment: 'Operations', movementDate: '2026-01-18', requestedBy: 'Samuel Opio', approvedBy: 'Grace Amanya', status: 'completed' },
    { id: 2, assetName: 'Canon Printer', category: 'Office Equipment', serialNumber: 'SN-CLB-003', assetTag: 'TAG-0003', fromBranch: 'Head Office', fromDepartment: 'Finance', toBranch: 'Mbarara Branch', toDepartment: 'Finance', movementDate: '2026-01-25', requestedBy: 'Alice Nansubuga', approvedBy: 'Peter Omara', status: 'completed' },
    { id: 3, assetName: 'Motorola Radio', category: 'Office Equipment', serialNumber: 'SN-MR-005', assetTag: 'TAG-0005', fromBranch: 'Kampala Branch', fromDepartment: 'Security', toBranch: 'Jinja Branch', toDepartment: 'Security', movementDate: '2026-02-08', requestedBy: 'Robert Atim', approvedBy: '', status: 'pending' },
    { id: 4, assetName: 'Dell Monitor', category: 'IT Equipment', serialNumber: 'SN-DM-004', assetTag: 'TAG-0004', fromBranch: 'Head Office', fromDepartment: 'Finance', toBranch: 'Head Office', toDepartment: 'Admin', movementDate: '2026-03-02', requestedBy: 'Jane Achola', approvedBy: 'Grace Amanya', status: 'completed' },
    { id: 5, assetName: 'Toyota Hilux', category: 'Fleet', serialNumber: 'SN-TH-002', assetTag: 'TAG-0002', fromBranch: 'Gulu Branch', fromDepartment: 'Operations', toBranch: 'Kampala Branch', toDepartment: 'Operations', movementDate: '2026-03-15', requestedBy: 'Mary Akot', approvedBy: '', status: 'pending' },
];

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

const MovementReport = () => {
    const [rows, setRows] = useState<MovementRow[]>(MOCK_ROWS);

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'completed').length;
    const pending = rows.filter(r => r.status === 'pending').length;
    const branches = new Set(rows.map(r => r.fromBranch)).size;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Movements', value: total, icon: <LocalShippingOutlinedIcon />, color: ACCENT, subLabel: 'All transfers' },
            { label: 'Completed', value: completed, icon: <CheckCircleOutlinedIcon />, color: '#15803D', trend: 3, subLabel: 'Confirmed transfers' },
            { label: 'Pending Approval', value: pending, icon: <HourglassEmptyOutlinedIcon />, color: '#D97706', subLabel: 'Awaiting action' },
            { label: 'Branches Involved', value: branches, icon: <SwapHorizOutlinedIcon />, color: '#0369A1', subLabel: 'Unique locations' },
        ]} />
    );

    const handleFilters = (f: ReportShellFilters) => {
        let filtered = [...MOCK_ROWS];
        if (f.branch) filtered = filtered.filter(r => r.fromBranch === f.branch || r.toBranch === f.branch);
        if (f.category) filtered = filtered.filter(r => r.category === f.category);
        if (f.status) filtered = filtered.filter(r => r.status === f.status);
        setRows(filtered);
    };

    return (
        <ReportShell
            title="Asset Movement Report"
            subtitle="Transfers and location changes across all branches and departments"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'category', 'status']}
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

export default MovementReport;
