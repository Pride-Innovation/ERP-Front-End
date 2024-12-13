import { ITableHeader } from "./interface";

const EXCLUDED_KEYS_COMMON = ["action", "image", "assetStatus", "status", "availability"];
const EXCLUDED_KEYS_IMAGE = ["action", "assetStatus", "status", "availability"];
const EXCLUDED_KEYS_STATUS = ["image", "action", "availability"];
const EXCLUDED_KEYS_BOOLEAN = ["image", "action", "status", "assetStatus"];

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {

    return Object.entries(obj).map(([key, value]) => {

        return ['string', 'number'].includes(typeof value) && !(EXCLUDED_KEYS_COMMON.includes(key)) ? ({ label: key, isText: true })
            : ['string'].includes(typeof value) && !(EXCLUDED_KEYS_IMAGE.includes(key)) && key === "image" ? ({ label: key, isImage: true })
                : ['string'].includes(typeof value) && !(EXCLUDED_KEYS_STATUS.includes(key)) && ["status", "assetStatus"].includes(key) ? ({ label: key, isStatus: true })
                    : (typeof value === "string") && !(EXCLUDED_KEYS_BOOLEAN.includes(key)) && ["availability"].includes(key) ? ({ label: key, isBoolen: true })
                        : (key === "action" && typeof value === 'object') ? ({
                            label: key, isAction: true, actionData: {
                                label: value?.label,
                                options: value?.options
                            }
                        }) : null

    }) as Array<ITableHeader>;
}