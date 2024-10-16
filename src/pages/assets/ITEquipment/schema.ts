import * as yup from 'yup';

export const ITEquipmentSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    category: yup.string().required('Category is required'),
    engravedNumber: yup.string().required('Engraved number is required'),
    model: yup.string().required('Model is required'),
    serialNo: yup.string().required('Serial Number Name is required'),
    ram: yup.string().nullable().optional(),
    cpuSpeed: yup.string().nullable().optional(),
    hardDiskSize: yup.string().nullable().optional(),
    ipAddress: yup.string().nullable().optional(),
    macAddress: yup.string().nullable().optional(),
    interfaceType: yup.string().nullable().optional(),
    location: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    purchaseCost: yup.string().nullable().optional(),
    verificationDate: yup.string().nullable().optional(),
    deploymentDate: yup.string().nullable().optional(),
    costOfAsset: yup.number().nullable().optional().typeError("Must be a number"),
    netValue: yup.string().nullable().optional(),
    depreciationRate: yup.string().nullable().optional(),
    assignedTo: yup.string().nullable().optional(),
});
