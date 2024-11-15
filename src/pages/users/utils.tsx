import { usersMock } from '../../mocks/users';
import { useContext, useEffect, useState } from 'react';
import { getTableHeaders } from '../../components/tables/getTableHeaders';
import { ITableHeader } from '../../components/tables/interface';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { UserContext } from '../../context/user/UserContext';
import { IUser, IUsersTableData } from './interface';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { crudStates } from '../../utils/constants';

const UserUtils = () => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };


    const { setUsersTableData, users, setUsers } = useContext(UserContext);

    const {
        id,
        reportsTo,
        firstName,
        lastName,
        otherName,
        role,
        name,
        email,
        image,
        ...data
    } = usersMock[0];

    const rowData = {
        image: usersMock[0].image,
        name,
        email,
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.deactivate, label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const removeUserFromTable = (id: string | number) => {
        setUsers(() => users.filter(user => user.id !== id))
    };

    const handleUsers = (users: Array<IUser>) => {
        const data: Array<IUsersTableData> = users.map((user, index) => {
            const {
                reportsTo,
                firstName,
                lastName,
                otherName,
                ...data
            } = users[index];

            return (
                { ...data }
            )
        })

        setUsersTableData(data)

    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);


    return ({
        columnHeaders,
        handleCreation,
        setModalState,
        handleOpen,
        modalState,
        open,
        handleClose,
        handleUsers,
        removeUserFromTable
    })
}

export default UserUtils