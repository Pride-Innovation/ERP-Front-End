/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ITableHeader } from "./interface";

const EXCLUDED_KEYS_COMMON = ["action", "image", "assetStatus", "status", "availability", "purchaseCost"];
const EXCLUDED_KEYS_COST = ["action", "image", "assetStatus", "status", "availability"];
const EXCLUDED_KEYS_IMAGE = ["action", "assetStatus", "status", "availability", "purchaseCost"];
const EXCLUDED_KEYS_STATUS = ["image", "action", "availability", "purchaseCost"];
const EXCLUDED_KEYS_BOOLEAN = ["image", "action", "status", "assetStatus", "purchaseCost"];

export const getTableHeaders = (obj: Object): Array<ITableHeader> => {

    return Object.entries(obj).map(([key, value]) => {

        return ['string', 'number'].includes(typeof value) && !(EXCLUDED_KEYS_COMMON.includes(key)) ? ({ label: key, isText: true })
            : ['string', 'number'].includes(typeof value) && !(EXCLUDED_KEYS_COST.includes(key)) ? ({ label: key, isMoney: true })
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