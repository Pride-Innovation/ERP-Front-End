/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IOfficeEquipment } from "../../pages/assets/officeEquipment/interface";
import { inventoryMock } from "../inventory";
import { suppliersMock } from "../settings";
import { statusMocks } from "../status";
import { usersMock } from "../users";

export const officeEquipmentMock: IOfficeEquipment[] = [
    {
        id: 1,
        assetName: "Dell Laptop",
        hostname: "dell-laptop-01",
        detailNetBookValue: "300.00",
        engravedNumber: "DL-001",
        dateReceipt: "2022-01-15",
        make: "Dell",
        supplier: suppliersMock[0],
        unitOfMeasure: "pcs",
        purchaseCost: "900.00",
        costOfTheAsset: "600.00",
        netValueB: "300.00",
        assetStatus: statusMocks[0],
        description: "Core i5, 8GB RAM, 256GB SSD",
        image: "url_to_image_1",
        assignedTo: usersMock[0],
        lpoNumber: "",
        stock: inventoryMock[0],
        commodity: null
    }
];
