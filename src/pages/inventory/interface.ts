interface IInventory {
    id?: string | number;
    name: string;
    quantityInStock: string | number;
    unitOfMeasure: string;
    location: string;
    category: string;
    reorderLevel: string;
    costPrice: string;
    purchasePrice: string
    supplier: string
    description: string
    expirationDate: string
}

export type {
    IInventory
}