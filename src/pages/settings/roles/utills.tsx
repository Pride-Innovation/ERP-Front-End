import { useEffect, useState } from "react";
import { IPermission } from "../interface";
import { crudStates } from "../../../utils/constants";

const RoleUtills = () => {
    const endPoint = "posts";
    const [permissions, setPermissions] = useState<Array<IPermission>>([] as Array<IPermission>);
    const [models, setModels] = useState<Array<IPermission>>([] as Array<IPermission>);
    const [mainCheckedState, setMainCheckedState] = useState<{ [key: string]: boolean }>({
        create: false,
        read: false,
        update: false,
        delete: false
    });

    const filterPermissions = (verb: string): Array<IPermission> => {
        return permissions?.filter(perm => perm.name.indexOf(verb) !== -1);
    }

    const filterUserPermissions = (verb: string, userPermission: Array<IPermission>): Array<IPermission> => {
        return userPermission?.filter(perm => perm.name.indexOf(verb) !== -1);
    }


    const determineCrudStates = (userPermissions: Array<IPermission>) => {
        const createList = filterPermissions(crudStates.create);
        const readList = filterPermissions(crudStates.read);
        const updateList = filterPermissions(crudStates.update);
        const deleteList = filterPermissions(crudStates.delete);


        const createUserList = filterUserPermissions(crudStates.create, userPermissions);
        const readUserList = filterUserPermissions(crudStates.read, userPermissions);
        const updateUserList = filterUserPermissions(crudStates.update, userPermissions);
        const deleteUserList = filterUserPermissions(crudStates.delete, userPermissions);

        setMainCheckedState(() => {
            return {
                create: createList?.length === createUserList?.length ? true : false,
                read: readList?.length === readUserList?.length ? true : false,
                update: updateList?.length === updateUserList?.length ? true : false,
                delete: deleteList?.length === deleteUserList?.length ? true : false,
            }
        })

    }

    const determinTextWithCreate = (permissions: Array<{ id: string | number, name: string }>) => {
        const response = permissions?.filter(perm => perm.name.indexOf("CREATE") !== -1) as Array<IPermission>;
        const modelsList = response?.map(model => ({
            ...model,
            name: model.name.split("_")[1]
        }))
        setModels(modelsList);
    }

    useEffect(() => {
        if (permissions?.length > 0) {
            determinTextWithCreate(permissions);
        }
        // eslint-disable-next-line
    }, [permissions]);

    console.log(models, mainCheckedState)
    return (
        { endPoint, setPermissions, determineCrudStates }
    )
}

export default RoleUtills