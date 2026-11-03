import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import ReportShell, { ReportShellFilters } from '../ReportShell';
import ReportSummaryCards from '../ReportSummaryCards';
import ReportDataTable, { ReportColumn, StatusChip } from '../ReportDataTable';
import useReportData, { REPORT_PAGE_SIZE, truncationNotice } from '../useReportData';
import { fetchRowsService } from '../../../core/apis/globalService';
import { STOCK_STATUS_CODES } from '../reportStatus';
import useAccessScope from '../../../core/permissions/useAccessScope';

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
    /** The line's category id, so a category filter can trim the other lines of a matched order. */
    categoryId: number | null;
    /** The order this line belongs to, so the cards can count orders rather than lines. */
    orderId: number;
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
    /*
     * No Department column, and no Department filter. Neither an order nor a commodity records a
     * department, so the column read "—" on every row and the filter - comparing against a name no
     * row carried - emptied the table whatever was picked.
     */
    { id: 'branch', label: 'Branch', minWidth: 120 },
    { id: 'stockedBy', label: 'Stocked By', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100, format: (v, r) => <StatusChip value={v} code={r.statusCode} /> },
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
    const lines: any[] = stock.commodities ?? stock.stockCommodities ?? [];
    const base = {
        orderId: stock.id,
        // The same date the Period filter uses on the server: ordered, else created.
        date: fmtDate(stock.orderDate ?? stock.createDate),
        supplier: stock.supplier?.name ?? '—',
        lpoNumber: stock.lpoNumber ?? stock.poNumber ?? '—',
        branch: stock.branch?.name ?? '—',
        // Filled by the server from the creator's id; it sent no name before, so this read "—".
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
            categoryId: null,
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
            categoryId: l.commodity?.assetType?.id ?? null,
            quantity: qty,
            // A commodity's unit is its `groupName` (pieces, reams, dozens...); there is no
            // `unitOfMeasure`, which is why this column read "—" on every row.
            unit: l.commodity?.groupName || '—',
            // Extended, not unit price — the column says "Purchase Cost" for the line.
            purchaseCost: money(unitCost * qty),
            costValue: unitCost * qty,
        };
    });
};

const StockReport = () => {
    /*
     * An order belongs to the branch that placed it, and the server scopes on exactly that. The
     * Branch filter is for Head Office: below ALL scope the server refuses any branch but the
     * caller's own, so the dropdown offered a list where every other choice was an error.
     */
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';

    const { rows, notice, loading, error, applyFilters, refresh } = useReportData<StockRow>(
        async (f: ReportShellFilters) => {
            const res = (await fetchRowsService({
                pageNumber: 0,
                pageSize: REPORT_PAGE_SIZE,
                endPoint: 'stocks',
                params: {
                    /*
                     * The period by when the order was placed - its order date, else its created
                     * date - which is the date the Date column shows. `startDate`/`endDate` mean the
                     * created date, so a row could appear under a period its own date was outside.
                     */
                    orderedFrom: f.dateFrom,
                    orderedTo: f.dateTo,
                    ...(seesEveryBranch && f.branchId ? { branchId: f.branchId } : {}),
                    stockStatusId: f.statusId,
                    // Orders with a line in the category, chosen by the server so the 1000-order cap
                    // cannot hide a match.
                    assetTypeId: f.categoryId,
                },
            })) as any;

            if (res?.status !== 200) throw new Error('stocks');
            const flat = ((res.data?.content ?? []) as any[]).flatMap(toRows);

            /*
             * The server returned every order with at least one line in the category; an order can
             * span categories, and a row is a line, so its other lines are dropped here. This trims
             * lines of orders already chosen - it never decides which orders appear.
             */
            const rows = f.categoryId
                ? flat.filter((r) => String(r.categoryId) === String(f.categoryId))
                : flat;

            return { rows, notice: truncationNotice(res, 'purchase orders') };
        },
    );

    const orders = new Set(rows.map((r) => r.orderId)).size;
    const totalValue = rows.reduce((sum, r) => sum + r.costValue, 0);
    const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
    // Orders, not lines: an order with three pending lines is one order awaiting delivery.
    const pending = new Set(rows.filter((r) => r.statusCode === 'stockPending').map((r) => r.orderId)).size;

    const summaryCards = (
        <ReportSummaryCards cards={[
            { label: 'Order Lines', value: rows.length, icon: <Inventory2OutlinedIcon />, color: ACCENT, subLabel: `${orders} order(s)` },
            { label: 'Units Ordered', value: totalUnits, icon: <LocalShippingOutlinedIcon />, color: '#15803D', subLabel: 'Across all lines' },
            { label: 'Purchase Value', value: money(totalValue), icon: <PaidOutlinedIcon />, color: '#7C3AED', subLabel: 'Ordered value' },
            { label: 'Awaiting Delivery', value: pending, icon: <PendingActionsOutlinedIcon />, color: '#D97706', subLabel: 'Orders not fully delivered' },
        ]} />
    );

    return (
        <ReportShell
            title="Stock / Purchase Report"
            subtitle="Purchase orders and what was ordered against each supplier"
            accentColor={ACCENT}
            filterFields={seesEveryBranch
                ? ['dateRange', 'branch', 'category', 'status']
                : ['dateRange', 'category', 'status']}
            statusCodes={STOCK_STATUS_CODES}
            // Purchase history: "This Month" opens empty for the first days of every month.
            defaultPreset="year"
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
                emptyMessage="No purchase orders match these filters."
            />
        </ReportShell>
    );
};

export default StockReport;
