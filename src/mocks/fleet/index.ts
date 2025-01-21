import { IFleet } from "../../pages/assets/fleet/interface";

export const fleetsMock: IFleet[] = [
    {
        id: 1,
        assetName: "Forklift",
        name: "",
        hostname: "FLK-001",
        detailNetBookValue: "15000",
        engravedNumber: "ENG-001",
        dateReceipt: "2022-01-15",
        make: "Toyota",
        assetCategory_id: "equipment",
        supplier: "ABC Supply Co.",
        unitOfMeasure: "units",
        purchaseCost: "12000",
        costOfTheAsset: "15000",
        netValueB: "8000",
        registrationNumber: "REG-001",
        desc: "Electric forklift for warehouse use.",
        image: "forklift.png",
        assetStatus: "active",
    }
];
