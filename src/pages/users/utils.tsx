import { usersMock } from '../../mocks/users';
import { useContext, useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { ITableHeader } from '../../components/tables/interface';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { UserContext } from '../../context/UserContext';
import { IUsersTableData } from '../../mocks/users/interface';

const UserUtils = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setUsersTableData } = useContext(UserContext);

    const {
        id,
        reportsTo,
        firstName,
        lastName,
        otherName,
        ...data
    } = usersMock[0];

    const rowData = {
        name: `${usersMock[0].firstName} ${usersMock[0].lastName} ${usersMock[0].otherName}`,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "deactivate", label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> }
            ]
        },
    };

    const handleUsers = () => {
        const data: Array<IUsersTableData> = usersMock.map((user, index) => {
            const {
                reportsTo,
                firstName,
                lastName,
                otherName,
                ...data
            } = usersMock[index];

            return (
                {
                    name: `${user.firstName} ${user.lastName} ${user.otherName}`,
                    ...data
                }
            )
        })

        setUsersTableData(data)

    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
        handleUsers();
    }, []);


    const header = { plural: 'Users', singular: 'User' };

    const handleCreation = () => {
        console.log('Create user clicked');
    };

    const handleImport = () => {
        console.log('Import users clicked');
    };

    return (
        {
            columnHeaders,
            handleCreation,
            handleImport,
            header,
        }
    )
}

export default UserUtils