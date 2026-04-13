import { useState } from 'react';
import { alpha, Box, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';

const ACCENT = '#0369A1';

interface StockRow {
    id: number;
    date: string;
    supplier: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    lpoNumber: string;
    purchaseCost: string;
    department: string;
    branch: string;
    stockedBy: string;
    status: string;
    remarks: string;
}

const MOCK_ROWS: StockRow[] = [
    { id: 1, date: '2026-01-05', supplier: 'Alican & Sons', itemName: 'HP Laptop', category: 'IT Equipment', quantity: 10, unit: 'Units', lpoNumber: 'LPO-2026-001', purchaseCost: 'UGX 15,000,000', department: 'IT', branch: 'Head Office', stockedBy: 'John Okello', status: 'completed', remarks: 'Delivered in full' },
    { id: 2, date: '2026-01-12', supplier: 'TechSupply Ltd', itemName: 'Office Chairs', category: 'Furniture', quantity: 25, unit: 'Units', lpoNumber: 'LPO-2026-002', purchaseCost: 'UGX 3,750,000', department: 'Admin', branch: 'Kampala Branch', stockedBy: 'Mary Akot', status: 'completed', remarks: 'Partial delivery' },
    { id: 3, date: '2026-01-20', supplier: 'PrintMasters', itemName: 'Canon Printer', category: 'Office Equipment', quantity: 5, unit: 'Units', lpoNumber: 'LPO-2026-003', purchaseCost: 'UGX 6,500,000', department: 'Finance', branch: 'Gulu Branch', stockedBy: 'Peter Omara', status: 'stockPending', remarks: 'Awaiting delivery' },
    { id: 4, date: '2026-02-03', supplier: 'Alican & Sons', itemName: 'Toyota Hilux', category: 'Fleet', quantity: 2, unit: 'Vehicles', lpoNumber: 'LPO-2026-004', purchaseCost: 'UGX 180,000,000', department: 'Operations', branch: 'Mbarara Branch', stockedBy: 'Grace Amanya', status: 'completed', remarks: '' },
    { id: 5, date: '2026-02-14', supplier: 'OfficePlus', itemName: 'Toner Cartridges', category: 'Stationery', quantity: 50, unit: 'Pieces', lpoNumber: 'LPO-2026-005', purchaseCost: 'UGX 2,500,000', department: 'Admin', branch: 'Head Office', stockedBy: 'John Okello', status: 'completed', remarks: '' },
    { id: 6, date: '2026-03-01', supplier: 'NetworkPro', itemName: 'Cisco Switch', category: 'IT Equipment', quantity: 4, unit: 'Units', lpoNumber: 'LPO-2026-006', purchaseCost: 'UGX 8,000,000', department: 'IT', branch: 'Head Office', stockedBy: 'Samuel Opio', status: 'stockPending', remarks: 'Under inspection' },
];

const COLUMNS: ReportColumn<StockRow>[] = [
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'supplier', label: 'Supplier', minWidth: 140 },
    { id: 'itemName', label: 'Item / Asset', minWidth: 160 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'quantity', label: 'Qty', minWidth: 60, align: 'center' },
    { id: 'unit', label: 'UOM', minWidth: 70 },
    { id: 'lpoNumber', label: 'LPO No.', minWidth: 110 },
    { id: 'purchaseCost', label: 'Purchase Cost', minWidth: 130, align: 'right' },
    { id: 'department', label: 'Department', minWidth: 110 },
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'stockedBy', label: 'Stocked By', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100, format: (v) => <StatusChip value={v} /> },
    { id: 'remarks', label: 'Remarks', minWidth: 140 },
];

const StockReport = () => {
    const [rows, setRows] = useState<StockRow[]>(MOCK_ROWS);

    const totalItems = rows.reduce((s, r) => s + r.quantity, 0);
    const totalValue = rows.filter(r => r.status === 'completed').length;
    const pending = rows.filter(r => r.status === 'stockPending').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Total Stock Entries', value: rows.length, icon: <Inventory2OutlinedIcon />, color: ACCENT, subLabel: 'All time' },
            { label: 'Total Units Stocked', value: totalItems.toLocaleString(), icon: <ShoppingCartOutlinedIcon />, color: '#059669', trend: 12, subLabel: 'This period' },
            { label: 'Completed Deliveries', value: totalValue, icon: <StorefrontOutlinedIcon />, color: '#15803D', subLabel: 'Fully received' },
            { label: 'Pending Deliveries', value: pending, icon: <AttachMoneyOutlinedIcon />, color: '#D97706', subLabel: 'Awaiting receipt' },
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
            title="Stock Management Report"
            subtitle="Inventory inflow, supplier deliveries and stock levels"
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

export default StockReport;
