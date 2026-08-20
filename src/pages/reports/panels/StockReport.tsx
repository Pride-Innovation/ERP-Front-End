import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';

const ACCENT = '#0369A1';

interface StockRow {
    id: string;
    date: string;
    supplier: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    lpoNumber: string;
    purchaseCost: string;
    /** Kept unformatted so the summary cards can total it. */
    costValue: number;
    department: string;
    branch: string;
    stockedBy: string;
    status: string;
    statusCode: string;
    remarks: string;
}

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

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const money = (n: number) => `UGX ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * One row per ordered line, not per order.
 *
 * <p>The columns name a supplier, an item, a quantity and a cost — that is a line on a purchase
 * order, and an order carries several. Flattening here keeps a row meaning one thing.
 */
const toRows = (stock: any): StockRow[] => {
    const lines: any[] = stock.stockCommodities ?? stock.commodities ?? [];
    const base = {
        date: fmtDate(stock.orderDate ?? stock.createDate),
        supplier: stock.supplier?.name ?? '—',
        lpoNumber: stock.lpoNumber ?? stock.poNumber ?? '—',
        branch: stock.branch?.name ?? '—',
        stockedBy: stock.createdByName ?? '—',
        status: stock.status?.name ?? '—',
        statusCode: stock.status?.status ?? '',
        remarks: stock.closeShortReason ?? stock.name ?? '—',
    };

    if (lines.length === 0) {
        // An order with no lines still belongs in the report — it is a real order, and hiding it
        // would silently shrink the totals.
        return [{
            ...base,
            id: `stock-${stock.id}`,
            itemName: stock.name ?? '—',
            category: '—',
            quantity: 0,
            unit: '—',
            purchaseCost: money(Number(stock.totalCost) || 0),
            costValue: Number(stock.totalCost) || 0,
            department: '—',
        }];
    }

    return lines.map((l, i) => {
        const qty = Number(l.orderedQuantity ?? l.quantity) || 0;
        const unitCost = Number(l.purchasePrice ?? l.costPrice) || 0;
        return {
            ...base,
            id: `stock-${stock.id}-${l.id ?? i}`,
            itemName: l.commodity?.name ?? '—',
            category: l.commodity?.assetType?.name ?? '—',
            quantity: qty,
            unit: l.commodity?.unitOfMeasure ?? '—',
            // Extended, not unit price — the column says "Purchase Cost" for the line.
            purchaseCost: money(unitCost * qty),
            costValue: unitCost * qty,
            department: l.commodity?.department?.name ?? '—',
        };
    });
};

const StockReport = () => {
    const { rows, loading, error, applyFilters, refresh } = useReportData<StockRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: 300,
                endPoint: 'stocks',
                params: { startDate: f.dateFrom, endDate: f.dateTo },
            })) as any;

            if (res?.status !== 200) throw new Error('stocks');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            /*
             * Branch, category, department and status are narrowed here: /stocks pages orders and
             * takes no filters for them, and category/department live on the commodity of a line
             * rather than on the order at all.
             */
            return flat.filter((r) => {
                if (f.branch && r.branch !== f.branch) return false;
                if (f.category && r.category !== f.category) return false;
                if (f.department && r.department !== f.department) return false;
                if (f.status && r.status !== f.status) return false;
                return true;
            });
        },
    );

    const orders = new Set(rows.map((r) => r.id.split('-').slice(0, 2).join('-'))).size;
    const totalValue = rows.reduce((sum, r) => sum + r.costValue, 0);
    const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
    const pending = rows.filter((r) => r.statusCode === 'stockPending').length;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Order Lines', value: rows.length, icon: <Inventory2OutlinedIcon />, color: ACCENT, subLabel: `${orders} order(s)` },
            { label: 'Units Ordered', value: totalUnits, icon: <LocalShippingOutlinedIcon />, color: '#15803D', subLabel: 'Across all lines' },
            { label: 'Purchase Value', value: money(totalValue), icon: <PaidOutlinedIcon />, color: '#7C3AED', subLabel: 'Ordered value' },
            { label: 'Awaiting Delivery', value: pending, icon: <PendingActionsOutlinedIcon />, color: '#D97706', subLabel: 'Partially stocked' },
        ]} />
    );

    return (
        <ReportShell
            title="Stock / Purchase Report"
            subtitle="Purchase orders and what was ordered against each supplier"
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
                emptyMessage="No purchase orders match these filters."
            />
        </ReportShell>
    );
};

export default StockReport;
