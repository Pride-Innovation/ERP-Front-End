export interface IAssets {
    id: string | number;
    name: string;
    category: string;
    engravedNumber: string;
    model: string;
    serialNo: string;
    ram?: string;
    cpuSpeed?: string;
    hardDiskSize?: string;
    ipAddress?: string;
    macAddress?: string;
    interfaceType?: string;
    location?: string;
    status?: string;
    purchaseCost?: string;
    verificationDate?: string;
    deploymentDate?: string;
    costOfAsset?: string | number;
    netValue?: string;
    depreciationRate?: string;
    assignedTo?: string
}