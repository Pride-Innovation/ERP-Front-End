export interface IAssetParticulars {
    name: string;
    serialNumber: string;
    engravedNumber: string;
}

export interface IRequest {
    id: string | number
    officerName: string;
    title: string;
    department: string;
    reason: string;
    quantity: number;
    destination: string;
    expectedReturnDate: string;
    particulars: Array<IAssetParticulars>
}

