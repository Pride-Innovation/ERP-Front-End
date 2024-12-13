import { ITableHeader } from "./interface";

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {

    return Object.entries(obj).map(([key, value]) => {

        console.log(key, value, "request data!!")
        return ['string', 'number'].includes(typeof value)
            && !(["action", "image", "assetStatus", "status", "availability"].includes(key))
            ? ({
                label: key,
                isText: true,
            }) : ['string'].includes(typeof value)
                && !(["action", "assetStatus", "status", "availability"].includes(key))
                && key === "image"
                ? ({
                    label: key,
                    isImage: true,
                }) : ['string'].includes(typeof value)
                    && !(["image", "action", "availability"].includes(key))
                    && ["status", "assetStatus"].includes(key)
                    ? ({
                        label: key,
                        isStatus: true,
                    })
                    : (typeof value === "string")
                        && !(["image", "action", "status", "assetStatus"].includes(key))
                        && ["availability"].includes(key)
                        ? ({
                            label: key,
                            isBoolen: true
                        })
                        // : (typeof value === 'boolean' && key !== "action") ? ({
                        //     label: key,
                        //     isBoolen: true
                        // })
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