import { useState } from 'react';
// import { alpha, Typography } from '@mui/material';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
// import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

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
    purchaseCost: string;
    netBookValue: string;
    acquisitionDate: string;
    condition: string;
}

const MOCK_ROWS: AssetRow[] = [
    { id: 1, assetName: 'HP EliteBook 840', category: 'IT Equipment', subCategory: 'Laptop', serialNumber: 'SN-HPE-001', assetTag: 'TAG-0001', branch: 'Head Office', department: 'IT', assignedTo: 'John Okello', status: 'active', purchaseCost: 'UGX 1,500,000', netBookValue: 'UGX 900,000', acquisitionDate: '2024-03-01', condition: 'Good' },
    { id: 2, assetName: 'Toyota Hilux D/C', category: 'Fleet', subCategory: 'Pickup', serialNumber: 'SN-TH-002', assetTag: 'TAG-0002', branch: 'Gulu Branch', department: 'Operations', assignedTo: 'Mary Akot', status: 'inRepair', purchaseCost: 'UGX 90,000,000', netBookValue: 'UGX 54,000,000', acquisitionDate: '2023-06-15', condition: 'Fair' },
    { id: 3, assetName: 'Canon LBP Printer', category: 'Office Equipment', subCategory: 'Printer', serialNumber: 'SN-CLB-003', assetTag: 'TAG-0003', branch: 'Mbarara Branch', department: 'Finance', assignedTo: 'Unassigned', status: 'inStore', purchaseCost: 'UGX 1,300,000', netBookValue: 'UGX 650,000', acquisitionDate: '2023-11-20', condition: 'Good' },
    { id: 4, assetName: 'Dell Monitor 24"', category: 'IT Equipment', subCategory: 'Monitor', serialNumber: 'SN-DM-004', assetTag: 'TAG-0004', branch: 'Head Office', department: 'Finance', assignedTo: 'Sarah Nalule', status: 'active', purchaseCost: 'UGX 700,000', netBookValue: 'UGX 420,000', acquisitionDate: '2024-01-10', condition: 'Good' },
    { id: 5, assetName: 'Motorola Radio', category: 'Office Equipment', subCategory: 'Communication', serialNumber: 'SN-MR-005', assetTag: 'TAG-0005', branch: 'Kampala Branch', department: 'Security', assignedTo: 'Peter Omara', status: 'active', purchaseCost: 'UGX 350,000', netBookValue: 'UGX 175,000', acquisitionDate: '2023-08-01', condition: 'Good' },
    { id: 6, assetName: 'HP DesignJet', category: 'Office Equipment', subCategory: 'Printer', serialNumber: 'SN-HD-006', assetTag: 'TAG-0006', branch: 'Head Office', department: 'Admin', assignedTo: 'Unassigned', status: 'disposed', purchaseCost: 'UGX 2,200,000', netBookValue: 'UGX 0', acquisitionDate: '2020-05-12', condition: 'Beyond repair' },
];

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

const AssetRegisterReport = () => {
    const [rows, setRows] = useState<AssetRow[]>(MOCK_ROWS);

    const activeCount = rows.filter(r => r.status === 'active').length;
    const inRepair = rows.filter(r => r.status === 'inRepair').length;
    const inStore = rows.filter(r => r.status === 'inStore').length;
    // const disposed = rows.filter(r => r.status === 'disposed').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Assets', value: rows.length, icon: <TuneOutlinedIcon />, color: ACCENT, subLabel: 'All registered' },
            { label: 'In Use / Active', value: activeCount, icon: <CheckCircleOutlinedIcon />, color: '#15803D', trend: 5, subLabel: 'Assigned & deployed' },
            { label: 'In Store', value: inStore, icon: <InventoryOutlinedIcon />, color: '#0369A1', subLabel: 'Unassigned stock' },
            { label: 'In Repair', value: inRepair, icon: <BuildOutlinedIcon />, color: '#D97706', subLabel: 'Under maintenance' },
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
            title="Asset Register Report"
            subtitle="Full register of all assets with values, locations and assignments"
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

export default AssetRegisterReport;
