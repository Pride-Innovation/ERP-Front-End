import { ITableHeader } from "./interface";

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {
    
    return Object.entries(obj).map(([key, value]) => {
        return ['string', 'number'].includes(typeof value) ? ({
            label: key,
            isText: true,
        }) : (typeof value === 'boolean') ? ({
            label: key,
            isBoolen: true
        }) : null

    }) as Array<ITableHeader>;
}