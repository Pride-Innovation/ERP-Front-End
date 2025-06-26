/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IITEquipment } from "../../pages/assets/ITEquipment/interface";
import { branchesMock } from "../branch";
import { inventoryMock } from "../inventory";
import { suppliersMock } from "../settings";
import { statusMocks } from "../status";
import { usersMock } from "../users";

export const itEquipmentMock: IITEquipment[] = [
    {
        id: 1,
        assetName: "Lenovo ThinkPad",
        hostname: "thinkpad-01",
        detailNetBookValue: "400.00",
        engravedNumber: "LT-001",
        dateReceipt: "2022-02-20",
        make: "Lenovo",
        supplier: suppliersMock[0],
        unitOfMeasure: "pcs",
        purchaseCost: "1200.00",
        costOfTheAsset: "800.00",
        netValueB: "400.00",
        model: "X1 Carbon",
        serialNumber: "L123456789",
        ram: "16GB",
        cpuSpeed: "3.6 GHz",
        hardDiskSize: "512GB SSD",
        macAddress: "00:1A:2B:3C:4D:5E",
        ipAddress: "192.168.1.101",
        interfaceType: "Ethernet",
        assetDepreciationRate: "20%",
        description: "Lightweight business laptop",
        image: "url_to_image_1",
        assetStatus: statusMocks[0],
        assignedTo: usersMock[0],
        branch: branchesMock[0],
        lpoNumber: "LPONUMB",
        stock: inventoryMock[0],
        commodity: null,
    }
]