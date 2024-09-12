import { ITableHeader } from "./interface";

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {

    return Object.entries(obj).map(([key, value]) => {
        return ['string', 'number'].includes(typeof value) && key !== "action" ? ({
            label: key,
            isText: true,
        }) : (typeof value === 'boolean' && key !== "action") ? ({
            label: key,
            isBoolen: true
        }) : (key === "action") ? ({
            label: key,
            actionLabel: value,
            isAction: true
        }) : null

    }) as Array<ITableHeader>;
}