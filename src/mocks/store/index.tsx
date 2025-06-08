import { IStore } from "../../pages/store/interface";

export const StoreMocks: Array<IStore> = [
    {
        "id": 53,
        "quantity": 4,
        "commodity": {
            "id": 1,
            "name": "Books",
            "groupName": "Dozen",
            "assetType": {
                "id": 1,
                "name": "Office Equipment",
                "description": "Office Equipment"
            }
        },
        "branch": {
            "id": 1,
            "name": "Head Office",
            "telephone": "+256778341692",
            "email": "headOffice@prideban.co.ug",
            "branchManager": null,
            "branchOperationsManager": null,
            "relationshipManager": null,
            "creditAdministrator": null,
            "region": null,
            "district": null
        }
    }
]