import { ITableHeader } from "./interface";

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {

    return Object.entries(obj).map(([key, value]) => {
        return ['string', 'number'].includes(typeof value)
            && key !== "action"
            && key !== "image"
            ? ({
                label: key,
                isText: true,
            }) : ['string'].includes(typeof value)
                && key !== "action"
                && key === "image"
                ? ({
                    label: key,
                    isImage: true,
                })
                : (typeof value === 'boolean' && key !== "action") ? ({
                    label: key,
                    isBoolen: true
                })
                    : (key === "action" && typeof value === 'object') ? ({
                        label: key,
                        isAction: true,
                        actionData: {
                            label: value?.label,
                            options: value?.options
                        }
                    }) : null

    }) as Array<ITableHeader>;
}