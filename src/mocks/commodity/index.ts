/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ICommodity } from "../../pages/request/interface";

export const requestCommoditiesMocks: Array<{
    commodity: ICommodity,
    quantity: number
}> = [
        {
            commodity: {
                id: 1,
                name: "Books",
                groupName: "Dozen",
                assetType: null
            },
            quantity: 20
        }
    ]