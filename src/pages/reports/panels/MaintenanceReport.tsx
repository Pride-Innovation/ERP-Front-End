import { useState } from 'react';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

const ACCENT = '#0891B2';

interface MaintenanceRow {
    id: number;
    assetName: string;
    assetTag: string;
    category: string;
    branch: string;
    department: string;
    maintenanceType: string;
    vendor: string;
    cost: string;
    startDate: string;
    completionDate: string;
    status: string;
    technician: string;
    description: string;
}

const MOCK_ROWS: MaintenanceRow[] = [
    { id: 1, assetName: 'Toyota Hilux D/C', assetTag: 'TAG-0002', category: 'Fleet', branch: 'Gulu Branch', department: 'Operations', maintenanceType: 'Corrective', vendor: 'Toyota Uganda', cost: 'UGX 2,400,000', startDate: '2026-01-10', completionDate: '2026-01-18', status: 'completed', technician: 'Moses Ojok', description: 'Engine overhaul and tyre replacement' },
    { id: 2, assetName: 'HP EliteBook 840', assetTag: 'TAG-0001', category: 'IT Equipment', branch: 'Head Office', department: 'IT', maintenanceType: 'Corrective', vendor: 'ICT Solutions Ltd', cost: 'UGX 350,000', startDate: '2026-01-20', completionDate: '2026-01-21', status: 'completed', technician: 'Joel Ayot', description: 'Keyboard and screen replacement' },
    { id: 3, assetName: 'Canon LBP Printer', assetTag: 'TAG-0003', category: 'Office Equipment', branch: 'Mbarara Branch', department: 'Finance', maintenanceType: 'Preventive', vendor: 'PrintMasters', cost: 'UGX 120,000', startDate: '2026-02-05', completionDate: '2026-02-05', status: 'completed', technician: 'Eric Odongo', description: 'Cleaning and cartridge calibration' },
    { id: 4, assetName: 'Land Cruiser V8', assetTag: 'TAG-0020', category: 'Fleet', branch: 'Kampala Branch', department: 'Operations', maintenanceType: 'Preventive', vendor: 'Auto Garage Ltd', cost: 'UGX 800,000', startDate: '2026-02-25', completionDate: '', status: 'inRepair', technician: 'Moses Ojok', description: 'Service & oil change, awaiting parts' },
    { id: 5, assetName: 'Cisco Switch', assetTag: 'TAG-0021', category: 'IT Equipment', branch: 'Head Office', department: 'IT', maintenanceType: 'Corrective', vendor: 'NetworkPro', cost: 'UGX 550,000', startDate: '2026-03-10', completionDate: '2026-03-11', status: 'completed', technician: 'Joel Ayot', description: 'Firmware update and port replacement' },
    { id: 6, assetName: 'Air Conditioner', assetTag: 'TAG-0007', category: 'Office Equipment', branch: 'Jinja Branch', department: 'Admin', maintenanceType: 'Preventive', vendor: 'Cool Systems', cost: 'UGX 250,000', startDate: '2026-03-18', completionDate: '', status: 'inRepair', technician: 'Eric Odongo', description: 'Gas recharge and filter cleaning' },
];

const COLUMNS: ReportColumn<MaintenanceRow>[] = [
    { id: 'assetTag', label: 'Tag', minWidth: 90 },
    { id: 'assetName', label: 'Asset Name', minWidth: 170 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'department', label: 'Department', minWidth: 110 },
    { id: 'maintenanceType', label: 'Type', minWidth: 100 },
    { id: 'vendor', label: 'Vendor', minWidth: 140 },
    { id: 'cost', label: 'Cost', minWidth: 120, align: 'right' },
    { id: 'startDate', label: 'Start Date', minWidth: 100 },
    { id: 'completionDate', label: 'Completion', minWidth: 100, format: (v) => v || '—' },
    { id: 'technician', label: 'Technician', minWidth: 130 },
    { id: 'status', label: 'Status', minWidth: 100, format: (v) => <StatusChip value={v} /> },
    { id: 'description', label: 'Description', minWidth: 220 },
];

const MaintenanceReport = () => {
    const [rows, setRows] = useState<MaintenanceRow[]>(MOCK_ROWS);

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'completed').length;
    const inRepair = rows.filter(r => r.status === 'inRepair').length;
    const preventive = rows.filter(r => r.maintenanceType === 'Preventive').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Maintenance Jobs', value: total, icon: <BuildOutlinedIcon />, color: ACCENT, subLabel: 'All types' },
            { label: 'Completed Jobs', value: completed, icon: <EventNoteOutlinedIcon />, color: '#15803D', trend: 10, subLabel: 'Resolved successfully' },
            { label: 'In Progress', value: inRepair, icon: <EngineeringOutlinedIcon />, color: '#D97706', subLabel: 'Ongoing repairs' },
            { label: 'Preventive Services', value: preventive, icon: <AttachMoneyOutlinedIcon />, color: '#7C3AED', subLabel: 'Scheduled maintenance' },
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
            title="Asset Maintenance Report"
            subtitle="Repair history, maintenance costs, vendors and technicians"
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

export default MaintenanceReport;
