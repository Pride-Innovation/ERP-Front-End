import { useState } from 'react';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

const ACCENT = '#DC2626';

interface DisposalRow {
    id: number;
    assetName: string;
    category: string;
    branch: string;
    department: string;
    disposalDate: string;
    disposalMethod: string;
    reasonForDisposal: string;
    approvedBy: string;
    netBookValueAtDisposal: string;
    assetTag: string;
}

const MOCK_ROWS: DisposalRow[] = [
    { id: 1, assetName: 'HP DesignJet Printer', category: 'Office Equipment', branch: 'Head Office', department: 'Admin', disposalDate: '2025-06-01', disposalMethod: 'Auctioned', reasonForDisposal: 'Beyond economical repair', approvedBy: 'Grace Amanya', netBookValueAtDisposal: 'UGX 0', assetTag: 'TAG-0006' },
    { id: 2, assetName: 'Compaq Desktop PC', category: 'IT Equipment', branch: 'Gulu Branch', department: 'IT', disposalDate: '2025-08-14', disposalMethod: 'Scrapped', reasonForDisposal: 'Obsolete technology', approvedBy: 'Peter Omara', netBookValueAtDisposal: 'UGX 50,000', assetTag: 'TAG-0009' },
    { id: 3, assetName: 'Land Rover Defender', category: 'Fleet', branch: 'Mbarara Branch', department: 'Operations', disposalDate: '2025-09-30', disposalMethod: 'Sold', reasonForDisposal: 'High maintenance cost', approvedBy: 'Grace Amanya', netBookValueAtDisposal: 'UGX 8,000,000', assetTag: 'TAG-0012' },
    { id: 4, assetName: 'Fax Machine', category: 'Office Equipment', branch: 'Kampala Branch', department: 'Admin', disposalDate: '2025-11-05', disposalMethod: 'Donated', reasonForDisposal: 'Technology replaced by digital systems', approvedBy: 'Samuel Opio', netBookValueAtDisposal: 'UGX 0', assetTag: 'TAG-0015' },
    { id: 5, assetName: 'UPS Unit (APC)', category: 'IT Equipment', branch: 'Jinja Branch', department: 'IT', disposalDate: '2026-01-22', disposalMethod: 'Scrapped', reasonForDisposal: 'Battery failure — uneconomical to replace', approvedBy: 'Grace Amanya', netBookValueAtDisposal: 'UGX 30,000', assetTag: 'TAG-0018' },
];

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

const DisposalReport = () => {
    const [rows, setRows] = useState<DisposalRow[]>(MOCK_ROWS);

    const total = rows.length;
    const categories = new Set(rows.map(r => r.category)).size;
    const methods = new Set(rows.map(r => r.disposalMethod)).size;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Disposals', value: total, icon: <DeleteForeverOutlinedIcon />, color: ACCENT, subLabel: 'Decommissioned assets' },
            { label: 'Categories Involved', value: categories, icon: <CategoryOutlinedIcon />, color: '#7C3AED', subLabel: 'Unique categories' },
            { label: 'Disposal Methods', value: methods, icon: <EventAvailableOutlinedIcon />, color: '#0369A1', subLabel: 'Auctioned, Sold, Scrapped…' },
            { label: 'Total Recovered Value', value: 'UGX 8,080,000', icon: <AttachMoneyOutlinedIcon />, color: '#15803D', subLabel: 'From auctions & sales' },
        ]} />
    );

    const handleFilters = (f: ReportShellFilters) => {
        let filtered = [...MOCK_ROWS];
        if (f.branch) filtered = filtered.filter(r => r.branch === f.branch);
        if (f.department) filtered = filtered.filter(r => r.department === f.department);
        if (f.category) filtered = filtered.filter(r => r.category === f.category);
        setRows(filtered);
    };

    return (
        <ReportShell
            title="Asset Disposal Report"
            subtitle="Decommissioned assets, disposal methods and net book values"
            accentColor={ACCENT}
            filterFields={['dateRange', 'branch', 'department', 'category']}
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

export default DisposalReport;
