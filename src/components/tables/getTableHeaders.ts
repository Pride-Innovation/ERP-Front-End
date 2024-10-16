import { ITableHeader } from "./interface";

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {
    return Object.entries(obj).map(([key, value]) => {
        const valueType = typeof value;

        if (['string', 'number'].includes(valueType) &&
            !["action", "image", "assetStatus", "status"].includes(key)) {
            return {
                label: key,
                isText: true,
            };
        }

        if (valueType === 'string' && key === "image" &&
            !["action", "assetStatus", "status"].includes(key)) {
            return {
                label: key,
                isImage: true,
            };
        }

        if (['string'].includes(valueType) &&
            ["status", "assetStatus"].includes(key)) {
            return {
                label: key,
                isStatus: true,
            };
        }

        if (valueType === 'boolean' && key !== "action") {
            return {
                label: key,
                isBoolean: true,
            };
        }

        if (key === "action" && valueType === 'object') {
            return {
                label: key,
                isAction: true,
                actionData: {
                    label: value?.label,
                    options: value?.options,
                },
            };
        }

        return null;
    }).filter(header => header !== null) as Array<ITableHeader>;
}
