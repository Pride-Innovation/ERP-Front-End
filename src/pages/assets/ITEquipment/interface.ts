export interface IITEquipment {
    id?: string | number;
    name: string;
    category: string;
    engravedNumber: string;
    model: string;
    serialNo: string;
    ram?: string | null;
    cpuSpeed?: string | null;
    hardDiskSize?: string | null;
    ipAddress?: string | null;
    macAddress?: string | null;
    interfaceType?: string | null;
    location?: string | null;
    status?: string | null;
    purchaseCost?: string | null;
    verificationDate?: string | null;
    deploymentDate?: string | null;
    costOfAsset?: number | null;
    netValue?: string | null;
    depreciationRate?: string | null;
    assignedTo?: string | null
}