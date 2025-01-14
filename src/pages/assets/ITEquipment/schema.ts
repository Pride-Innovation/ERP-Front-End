import * as yup from 'yup';

export const ITEquipmentSchema = yup.object().shape({
    assetName: yup.string().required('Name is required'),
    engravedNumber: yup.string().required('Engraved Number is required'),
    hostname: yup.string().required('Host Name is required'),
    detailNetBookValue: yup.string().required('Detail Net Book Value is required'),
    dateReceipt: yup.string().required('Receipt Date is required'),
    make: yup.string().required('Make is required'),
    assetCategory_id: yup.string().required('Asset Category is required'),
    supplier: yup.string().required('Supplier is required'),
    unitOfMeasure: yup.string().required('Unit Of Measure is required'),
    purchaseCost: yup.string().required('Purchase Cost is required'),
    costOfTheAsset: yup.string().required('Asset Cost is required'),
    netValueB: yup.string().required('Net Value is required'),
    model: yup.string().nullable().optional(),
    serialNumber: yup.string().nullable().optional(),
    user_id: yup.string().nullable().optional(),
    branch_id: yup.string().nullable().optional(),
    ram: yup.string().nullable().optional(),
    cpuSpeed: yup.string().nullable().optional(),
    hardDiskSize: yup.string().nullable().optional(),
    location: yup.string().nullable().optional(),
    macAddress: yup.string().nullable().optional(),
    ipAddress: yup.string().nullable().optional(),
    interfaceType: yup.string().nullable().optional(),
    assetDepreciationRate: yup.string().nullable().optional(),
    assetSubCategory_id: yup.string().nullable().optional(),
    desc: yup.string().nullable().optional(),
    image: yup.string().nullable().optional(),
    assetStatus: yup.string().nullable().optional(),
    category: yup.string().nullable().optional(),
});


/*
{
    "category": "accesories",
    "assetName": "Fletcher Mayo",
    "engravedNumber": "776",
    "model": "Non est eiusmod ips",
    "serialNumber": "653",
    "assetStatus": "repair",
    "netValueB": "Ad tenetur praesenti",
    "assetDepreciationRate": "Voluptas est qui fac",
    "user_id": "poxov",
    "purchaseCost": "36",
    "hostname": "Ramona Underwood",
    "detailNetBookValue": "Eveniet esse eligen",
    "dateReceipt": "2025-01-14",
    "assetCategory_id": "1",
    "unitOfMeasure": "Placeat voluptatem",
    "costOfTheAsset": "22",
    "make": "Suscipit inventore q",
    "supplier": "Neque amet eos nihi"
}
*/


/*
{
    "id": 9,
    "assetName": "Zoe Hester",
    "hostname": "Olga Fischer",
    "detailNetBookValue": "Sed sed sint hic qui",
    "engravedNumber": "1",
    "dateReceipt": "2025-01-14 00:00:00",
    "make": "Aperiam nobis laboru",
    "supplier_id": 1,
    "unitOfMeasure_id": 1,
    "purchaseCost": "75000",
    "costOfTheAsset": "37000",
    "netValueB": "Tempore ipsa aut a",
    "model": "Proident accusamus",
    "serialNumber": "884",
    "user_id": 1,
    "ram": "8GB",
    "cpuSpeed": "2.7GH",
    "hardDiskSize": "500GB",
    "branch_id": 1,
    "macAddress": "128H1234455",
    "ipAddress": "143543ERTYY",
    "interfaceType": "223",
    "assetDepreciationRate": "Nihil qui autem ut q",
    "assetSubCategory_id": null,
    "desc": "Test Decription",
    "image": {},
    "ItAssetCategory_id": 1,
    "assetStatus_id": 1,
    "assetCategory_id": 1,
    "supplier": 1,
    "unitOfMeasure": 1
}*/

