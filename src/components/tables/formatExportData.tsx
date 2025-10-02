/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { fetchAllRowsService } from "../../core/apis/globalService";
import { IITEquipment } from "../../pages/assets/ITEquipment/interface";
import { IInventory, IStockCommodities } from "../../pages/inventory/interface";
import { IRequest } from "../../pages/request/interface";
import { IUser } from "../../pages/users/interface";
import { camelCaseToWords } from "../../utils/helpers";

/**
 * Formats and fetches export data for different modules.
 * @param moduleName - The name of the module (e.g., 'inventory', 'requests', 'users', 'assets').
 * @param param - Optional parameters for the API request.
 * @returns An object containing formatted data and column definitions.
 */
export type ModuleTypeMap = {
    inventory: IInventory;
    requests: IRequest;
    users: IUser;
    assets: IITEquipment;
}

/**
 * 
 * @param moduleName 
 * @param param 
 * @returns 
 * @description
 * This function fetches data from the API based on the module name and optional parameters.
 * It then processes the data to match the required export format, including defining column headers.
 * The function handles different data structures returned by the API and ensures that the output is consistent.
 * It supports modules like 'inventory', 'requests', 'users', and 'assets', each with its own specific data processing logic.
 */

async function formatExportData<T extends keyof ModuleTypeMap>(
    moduleName: T,
    param?: Record<string, any>
): Promise<{
    data: Array<any>;
    columns: Array<{ title: string; dataKey: string }>;
}> {
    try {
        // Fetch data from API
        const response = await fetchAllRowsService({ endPoint: moduleName, params: param });

        // Generate column definitions based on module type
        let columns: Array<{ title: string; dataKey: string }> = [];

        if (moduleName === 'inventory') {
            // Inventory-specific columns
            columns = [
                { title: 'Date', dataKey: 'date' },
                { title: 'LPO Number', dataKey: 'lpoNumber' },
                { title: 'Supplier', dataKey: 'supplier' },
                { title: 'Supply', dataKey: 'name' },
                { title: 'Ordered', dataKey: 'totalOrdered' },
                { title: 'Delivered', dataKey: 'totalDelivered' },
                { title: 'Status', dataKey: 'status' },
                { title: 'Branch', dataKey: 'branch' }
            ];
        } else if (moduleName === 'requests') {
            // Request-specific columns
            columns = [
                { title: 'Request No', dataKey: 'requestNo' },
                { title: 'Item', dataKey: 'itemName' },
                { title: 'Status', dataKey: 'status' },
                { title: 'Requester', dataKey: 'requestor' },
                { title: 'Branch', dataKey: 'branch' },
                { title: 'Department', dataKey: 'department' },
                { title: 'Date', dataKey: 'dateRequested' }
            ];
        } else if (moduleName === 'users') {
            // User-specific columns
            columns = [
                { title: 'Name', dataKey: 'fullName' },
                { title: 'Email', dataKey: 'email' },
                { title: 'Phone', dataKey: 'phoneNumber' },
                { title: 'Branch', dataKey: 'branch' },
                { title: 'Role', dataKey: 'role' },
                { title: 'Status', dataKey: 'status' }
            ];
        } else if (moduleName === 'assets') {
            // Asset-specific columns
            columns = [
                { title: 'Asset Name', dataKey: 'assetName' },
                { title: 'Manufacturer', dataKey: 'make' },
                { title: 'Engraved Number', dataKey: 'engravedNumber' },
                { title: 'Model', dataKey: 'model' },
                { title: 'Serial Number', dataKey: 'serialNumber' },
                { title: 'Date Received', dataKey: 'dateReceipt' },
                { title: 'Location', dataKey: 'branch' },
                { title: 'Assigned To', dataKey: 'assignedTo' },
                { title: 'Status', dataKey: 'assetStatus' }
            ];
        }

        // Process the response data based on module type
        const processedData = processResponseData(response, moduleName);

        return {
            data: processedData,
            columns
        };
    } catch (error) {
        console.error(`Error fetching ${moduleName} data:`, error);
        return {
            data: [],
            columns: []
        };
    }
}

const sumTotalOrdered = (commodities: Array<IStockCommodities>): number => {
    return commodities.reduce((acc, val) => (acc + val.orderedQuantity), 0)
}

const sumTotalDelivered = (commodities: Array<IStockCommodities>): number => {
    return commodities.reduce((acc, val) => (acc + val.deliveredQuantity), 0)
}

// Helper function to process raw API response data
function processResponseData(data: any, moduleName: string): Array<any> {
    // Handle different API response structures
    let items: any[] = [];

    // Check if the response has data property (typical axios response)
    if (data?.data && Array.isArray(data.data)) {
        items = data.data;
    }
    // Check if the response has content property
    else if (data?.content && Array.isArray(data.content)) {
        items = data.content;
    }
    // Check if the response is already an array
    else if (Array.isArray(data)) {
        items = data;
    }
    // Direct response object (non-array, non-content case)
    else if (data && typeof data === 'object') {
        items = [data];
    }

    if (items.length === 0) {
        return [];
    }

    // Type-specific processing
    if (moduleName === 'inventory') {
        // Process inventory data
        return items.map(item => {
            // Create a new object with transformed properties
            return {
                id: item.id,
                lpoNumber: item.lpoNumber || '',
                name: item.name || '',
                status: camelCaseToWords(item.status?.status || ''),
                supplier: item.supplier?.name || '',
                branch: item.branch?.name || '',
                totalOrdered: item.commodities ? sumTotalOrdered(item.commodities as IStockCommodities[]) || 0 : 0,
                totalDelivered: item.commodities ? sumTotalDelivered(item.commodities as IStockCommodities[]) || 0 : 0,
                date: item.createDate ? new Date(item.createDate).toLocaleDateString() : ''
            };
        });
    } else if (moduleName === 'requests') {
        // Process request data
        return items.map(item => ({
            id: item.id,
            requestNo: item.requestNo || '',
            itemName: item.itemName || '',
            status: item.status?.status || '',
            requestor: item.requestor?.name || '',
            branch: item.branch?.name || '',
            department: item.department?.name || '',
            dateRequested: item.dateRequested ? new Date(item.dateRequested).toLocaleDateString() : ''
        }));
    } else if (moduleName === 'users') {
        // Process user data
        return items.map(item => ({
            id: item.id,
            fullName: item.fullName || '',
            email: item.email || '',
            phoneNumber: item.phoneNumber || '',
            branch: item.branch?.name || '',
            role: item.role?.name || '',
            status: item.status || ''
        }));
    } else if (moduleName === 'assets') {
        // Process IT Equipment data
        return items.map(item => ({
            id: item.id,
            assetName: item.assetName || '',
            make: item.make || '',
            model: item.model || '',
            serialNumber: item.serialNumber || '',
            engravedNumber: item.engravedNumber || '',
            branch: item.branch?.name || '',
            assignedTo: item.assignedTo ? item.assignedTo?.firstName + ' ' + item.assignedTo?.lastName || '' : '',
            assetStatus: item.assetStatus.name || '',
            dateReceipt: item.dateReceipt ? new Date(item.dateReceipt).toLocaleDateString() : ''
        }));
    }

    // Default case - return items with minimal processing
    return items;
}

export default formatExportData;