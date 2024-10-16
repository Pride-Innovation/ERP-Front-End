export interface IFleet {
    id?: string | number;
    assetName: string;
    hostname: string;
    detailNetBookValue: string;
    engravedNumber: string;
    dateReceipt: string;
    make: string;
    assetCategory_id: string;
    supplier: string;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB: string;
    registrationNumber?: string;
    desc?: string;
    image?: string;
    assetStatus?: string;
}

export interface IExtraFleetFields {
    status1: string;
    status2: string;
    status3: string;
    status4: string;
    status5: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
}